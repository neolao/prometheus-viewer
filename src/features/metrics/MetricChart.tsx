import {
	type FormEvent,
	type PointerEvent as ReactPointerEvent,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	fetchMetricRange,
	type MetricRangePoint,
	type MetricRangeSeries,
} from "../../api/prometheus";

interface MetricChartProps {
	baseUrl: string;
	machine: string;
	metricName: string;
}

type RangeOption = "1h" | "6h" | "24h" | "7d" | "custom";

type LoadState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "success"; series: MetricRangeSeries[] }
	| { status: "error"; message: string };

interface PredefinedRange {
	label: string;
	durationSeconds: number;
	stepSeconds: number;
}

const PREDEFINED_RANGES: Record<
	Exclude<RangeOption, "custom">,
	PredefinedRange
> = {
	"1h": { label: "Last hour", durationSeconds: 3600, stepSeconds: 15 },
	"6h": { label: "Last 6 hours", durationSeconds: 6 * 3600, stepSeconds: 60 },
	"24h": {
		label: "Last 24 hours",
		durationSeconds: 24 * 3600,
		stepSeconds: 300,
	},
	"7d": {
		label: "Last 7 days",
		durationSeconds: 7 * 24 * 3600,
		stepSeconds: 1800,
	},
};

const DYNAMIC_RANGE_TARGET_POINT_COUNT = 300;
const DYNAMIC_RANGE_MIN_STEP_SECONDS = 15;
const DRAG_THRESHOLD_PIXELS = 8;

const SERIES_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"];

function colorForSeries(index: number): string {
	return SERIES_COLORS[index % SERIES_COLORS.length] as string;
}

function formatLabels(labels: Record<string, string>): string {
	return Object.entries(labels)
		.map(([key, value]) => `${key}="${value}"`)
		.join(", ");
}

function seriesLabel(labels: Record<string, string>): string {
	return formatLabels(labels) || "(no labels)";
}

interface FinitePoint {
	timestamp: number;
	value: number;
}

interface FinitePointSeries {
	labels: Record<string, string>;
	points: FinitePoint[];
}

interface ChartDomain {
	minTimestamp: number;
	maxTimestamp: number;
	minValue: number;
	maxValue: number;
	timestampRange: number;
	valueRange: number;
}

function toFinitePoints(points: MetricRangePoint[]): FinitePoint[] {
	return points
		.map((point) => ({
			timestamp: point.timestamp,
			value: Number.parseFloat(point.value),
		}))
		.filter((point) => Number.isFinite(point.value));
}

function computeSeriesWithFinitePoints(
	series: MetricRangeSeries[],
): FinitePointSeries[] {
	return series.map((oneSeries) => ({
		labels: oneSeries.labels,
		points: toFinitePoints(oneSeries.points),
	}));
}

function computeDomain(
	seriesWithFinitePoints: FinitePointSeries[],
): ChartDomain {
	const allPoints = seriesWithFinitePoints.flatMap(
		(oneSeries) => oneSeries.points,
	);

	if (allPoints.length === 0) {
		return {
			minTimestamp: 0,
			maxTimestamp: 0,
			minValue: 0,
			maxValue: 0,
			timestampRange: 1,
			valueRange: 1,
		};
	}

	const timestamps = allPoints.map((point) => point.timestamp);
	const values = allPoints.map((point) => point.value);
	const minTimestamp = Math.min(...timestamps);
	const maxTimestamp = Math.max(...timestamps);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);

	return {
		minTimestamp,
		maxTimestamp,
		minValue,
		maxValue,
		timestampRange: maxTimestamp - minTimestamp || 1,
		valueRange: maxValue - minValue || 1,
	};
}

function findNearestPoint(
	points: FinitePoint[],
	targetTimestamp: number,
): FinitePoint | undefined {
	return points.reduce<FinitePoint | undefined>((closest, point) => {
		if (!closest) {
			return point;
		}
		const closestDistance = Math.abs(closest.timestamp - targetTimestamp);
		const pointDistance = Math.abs(point.timestamp - targetTimestamp);
		return pointDistance < closestDistance ? point : closest;
	}, undefined);
}

function formatTimestamp(timestamp: number): string {
	return new Date(timestamp * 1000).toISOString().slice(11, 19);
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;

interface DragState {
	pointerId: number;
	startClientX: number;
	startFraction: number;
	currentFraction: number;
	dragging: boolean;
}

function fractionFromClientX(
	clientX: number,
	rect: { left: number; width: number },
): number {
	return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function MetricChartSvg({
	seriesWithFinitePoints,
	domain,
	hiddenIndices,
	onHover,
	onHoverEnd,
	onZoomSelect,
}: {
	seriesWithFinitePoints: FinitePointSeries[];
	domain: ChartDomain;
	hiddenIndices: Set<number>;
	onHover: (timestamp: number, fraction: number) => void;
	onHoverEnd: () => void;
	onZoomSelect: (startTimestamp: number, endTimestamp: number) => void;
}) {
	const [dragState, setDragState] = useState<DragState | null>(null);

	function timestampFromFraction(fraction: number): number {
		return domain.minTimestamp + fraction * domain.timestampRange;
	}

	function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
		event.currentTarget.setPointerCapture?.(event.pointerId);
		const rect = event.currentTarget.getBoundingClientRect();
		const fraction = fractionFromClientX(event.clientX, rect);
		setDragState({
			pointerId: event.pointerId,
			startClientX: event.clientX,
			startFraction: fraction,
			currentFraction: fraction,
			dragging: false,
		});
		onHover(timestampFromFraction(fraction), fraction);
	}

	function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
		const rect = event.currentTarget.getBoundingClientRect();
		const fraction = fractionFromClientX(event.clientX, rect);

		if (dragState && dragState.pointerId === event.pointerId) {
			const dragging =
				dragState.dragging ||
				Math.abs(event.clientX - dragState.startClientX) >
					DRAG_THRESHOLD_PIXELS;
			setDragState({ ...dragState, currentFraction: fraction, dragging });
			if (dragging) {
				onHoverEnd();
				return;
			}
		}

		onHover(timestampFromFraction(fraction), fraction);
	}

	function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
		event.currentTarget.releasePointerCapture?.(event.pointerId);

		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}

		if (dragState.dragging) {
			const startFraction = Math.min(
				dragState.startFraction,
				dragState.currentFraction,
			);
			const endFraction = Math.max(
				dragState.startFraction,
				dragState.currentFraction,
			);
			onZoomSelect(
				timestampFromFraction(startFraction),
				timestampFromFraction(endFraction),
			);
		} else {
			const rect = event.currentTarget.getBoundingClientRect();
			const fraction = fractionFromClientX(event.clientX, rect);
			onHover(timestampFromFraction(fraction), fraction);
		}

		setDragState(null);
	}

	function handlePointerLeave() {
		if (!dragState?.dragging) {
			onHoverEnd();
		}
	}

	return (
		<svg
			role="img"
			aria-label="Metric evolution chart"
			viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
			width="100%"
			height={CHART_HEIGHT}
			style={{ cursor: "crosshair", touchAction: "none" }}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
		>
			{seriesWithFinitePoints.map((oneSeries, index) => {
				if (hiddenIndices.has(index)) {
					return null;
				}

				const pointsAttr = oneSeries.points
					.map((point) => {
						const x =
							((point.timestamp - domain.minTimestamp) /
								domain.timestampRange) *
							CHART_WIDTH;
						const y =
							CHART_HEIGHT -
							((point.value - domain.minValue) / domain.valueRange) *
								CHART_HEIGHT;
						return `${x},${y}`;
					})
					.join(" ");

				return (
					<polyline
						// biome-ignore lint/suspicious/noArrayIndexKey: series have no stable identifier
						key={`${formatLabels(oneSeries.labels)}-${index}`}
						points={pointsAttr}
						fill="none"
						stroke={colorForSeries(index)}
					/>
				);
			})}
			{dragState?.dragging && (
				<rect
					x={
						Math.min(dragState.startFraction, dragState.currentFraction) *
						CHART_WIDTH
					}
					y={0}
					width={
						Math.abs(dragState.currentFraction - dragState.startFraction) *
						CHART_WIDTH
					}
					height={CHART_HEIGHT}
					fill="var(--border)"
					fillOpacity={0.5}
				/>
			)}
		</svg>
	);
}

function MetricChartTooltip({
	hover,
	seriesWithFinitePoints,
	hiddenIndices,
}: {
	hover: { timestamp: number; fraction: number };
	seriesWithFinitePoints: FinitePointSeries[];
	hiddenIndices: Set<number>;
}) {
	const rows = seriesWithFinitePoints
		.map((oneSeries, index) => {
			if (hiddenIndices.has(index)) {
				return null;
			}
			const nearest = findNearestPoint(oneSeries.points, hover.timestamp);
			if (!nearest) {
				return null;
			}
			return {
				key: `${formatLabels(oneSeries.labels)}-${index}`,
				label: seriesLabel(oneSeries.labels),
				value: nearest.value,
			};
		})
		.filter((row): row is { key: string; label: string; value: number } =>
			Boolean(row),
		);

	if (rows.length === 0) {
		return null;
	}

	const horizontalAnchor =
		hover.fraction < 0.15
			? "translateX(0%)"
			: hover.fraction > 0.85
				? "translateX(-100%)"
				: "translateX(-50%)";

	return (
		<div
			role="tooltip"
			style={{
				position: "absolute",
				left: `${hover.fraction * 100}%`,
				top: 4,
				transform: horizontalAnchor,
				background: "var(--bg)",
				color: "var(--text)",
				border: "1px solid var(--border)",
				borderRadius: 4,
				boxShadow: "var(--shadow)",
				padding: "0.4em 0.6em",
				pointerEvents: "none",
				whiteSpace: "nowrap",
			}}
		>
			<p style={{ margin: 0, fontFamily: "var(--mono)" }}>
				{formatTimestamp(hover.timestamp)}
			</p>
			<ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
				{rows.map((row) => (
					<li key={row.key}>
						{row.label}:{" "}
						<span style={{ fontFamily: "var(--mono)" }}>{row.value}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function MetricChartLegend({
	series,
	hiddenIndices,
	onToggle,
}: {
	series: MetricRangeSeries[];
	hiddenIndices: Set<number>;
	onToggle: (index: number) => void;
}) {
	return (
		<div>
			{series.map((oneSeries, index) => {
				const visible = !hiddenIndices.has(index);
				return (
					<button
						// biome-ignore lint/suspicious/noArrayIndexKey: series have no stable identifier
						key={`${formatLabels(oneSeries.labels)}-${index}`}
						type="button"
						aria-pressed={visible}
						onClick={() => onToggle(index)}
					>
						<span
							aria-hidden="true"
							style={{
								display: "inline-block",
								width: "0.75em",
								height: "0.75em",
								marginInlineEnd: "0.4em",
								borderRadius: "2px",
								backgroundColor: visible
									? colorForSeries(index)
									: "transparent",
								border: `1px solid ${colorForSeries(index)}`,
							}}
						/>
						<span style={{ textDecoration: visible ? "none" : "line-through" }}>
							{seriesLabel(oneSeries.labels)}
						</span>
					</button>
				);
			})}
		</div>
	);
}

export function MetricChart({
	baseUrl,
	machine,
	metricName,
}: MetricChartProps) {
	const [rangeOption, setRangeOption] = useState<RangeOption>("1h");
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");
	const [appliedCustomRange, setAppliedCustomRange] = useState<{
		start: string;
		end: string;
	} | null>(null);
	const [state, setState] = useState<LoadState>({ status: "loading" });
	const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
	const [hover, setHover] = useState<{
		timestamp: number;
		fraction: number;
	} | null>(null);
	const [zoomRange, setZoomRange] = useState<{
		start: number;
		end: number;
	} | null>(null);

	useEffect(() => {
		let cancelled = false;

		function runFetch(start: number, end: number, step: number) {
			setState({ status: "loading" });
			setHiddenIndices(new Set());
			setHover(null);

			fetchMetricRange(baseUrl, metricName, machine, start, end, step)
				.then((series) => {
					if (!cancelled) {
						setState({ status: "success", series });
					}
				})
				.catch((error: unknown) => {
					if (!cancelled) {
						const message =
							error instanceof Error ? error.message : "Unknown error";
						setState({ status: "error", message });
					}
				});
		}

		if (zoomRange) {
			const step = Math.max(
				DYNAMIC_RANGE_MIN_STEP_SECONDS,
				Math.round(
					(zoomRange.end - zoomRange.start) / DYNAMIC_RANGE_TARGET_POINT_COUNT,
				),
			);
			runFetch(zoomRange.start, zoomRange.end, step);
			return () => {
				cancelled = true;
			};
		}

		if (rangeOption === "custom" && !appliedCustomRange) {
			setState({ status: "idle" });
			return;
		}

		let start: number;
		let end: number;
		let step: number;

		if (rangeOption === "custom" && appliedCustomRange) {
			start = Math.floor(new Date(appliedCustomRange.start).getTime() / 1000);
			end = Math.floor(new Date(appliedCustomRange.end).getTime() / 1000);
			step = Math.max(
				DYNAMIC_RANGE_MIN_STEP_SECONDS,
				Math.round((end - start) / DYNAMIC_RANGE_TARGET_POINT_COUNT),
			);
		} else {
			const range =
				PREDEFINED_RANGES[rangeOption as Exclude<RangeOption, "custom">];
			end = Math.floor(Date.now() / 1000);
			start = end - range.durationSeconds;
			step = range.stepSeconds;
		}

		runFetch(start, end, step);

		return () => {
			cancelled = true;
		};
	}, [
		baseUrl,
		machine,
		metricName,
		rangeOption,
		appliedCustomRange,
		zoomRange,
	]);

	function handleRangeOptionChange(value: RangeOption) {
		setRangeOption(value);
		setAppliedCustomRange(null);
		setZoomRange(null);
	}

	function handleCustomRangeSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setAppliedCustomRange({ start: customStart, end: customEnd });
		setZoomRange(null);
	}

	function handleZoomSelect(startTimestamp: number, endTimestamp: number) {
		setZoomRange({
			start: Math.round(startTimestamp),
			end: Math.round(endTimestamp),
		});
	}

	function toggleSeriesVisibility(index: number) {
		setHiddenIndices((previous) => {
			const next = new Set(previous);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	}

	const seriesWithFinitePoints = useMemo(
		() =>
			state.status === "success"
				? computeSeriesWithFinitePoints(state.series)
				: [],
		[state],
	);
	const domain = useMemo(
		() => computeDomain(seriesWithFinitePoints),
		[seriesWithFinitePoints],
	);

	const hasData =
		state.status === "success" &&
		state.series.some((oneSeries) => oneSeries.points.length > 0);
	const allSeriesHidden =
		state.status === "success" &&
		state.series.length > 0 &&
		state.series.every((_, index) => hiddenIndices.has(index));

	return (
		<div>
			<select
				aria-label="Time range"
				value={rangeOption}
				onChange={(event) =>
					handleRangeOptionChange(event.target.value as RangeOption)
				}
			>
				{Object.entries(PREDEFINED_RANGES).map(([value, range]) => (
					<option key={value} value={value}>
						{range.label}
					</option>
				))}
				<option value="custom">Custom</option>
			</select>

			{zoomRange && (
				<button type="button" onClick={() => setZoomRange(null)}>
					Reset zoom
				</button>
			)}

			{rangeOption === "custom" && (
				<form onSubmit={handleCustomRangeSubmit}>
					<input
						type="datetime-local"
						aria-label="Start"
						value={customStart}
						onChange={(event) => setCustomStart(event.target.value)}
					/>
					<input
						type="datetime-local"
						aria-label="End"
						value={customEnd}
						onChange={(event) => setCustomEnd(event.target.value)}
					/>
					<button type="submit">Apply</button>
				</form>
			)}

			{state.status === "idle" && (
				<p>Select a start and end date, then apply.</p>
			)}
			{state.status === "loading" && <p>Loading graph…</p>}
			{state.status === "error" && <p role="alert">{state.message}</p>}
			{state.status === "success" && !hasData && (
				<p>No data for this metric on this machine in the selected range.</p>
			)}
			{state.status === "success" && hasData && (
				<>
					<MetricChartLegend
						series={state.series}
						hiddenIndices={hiddenIndices}
						onToggle={toggleSeriesVisibility}
					/>
					{allSeriesHidden ? (
						<p>
							All series are hidden. Toggle one in the legend to display it.
						</p>
					) : (
						<div style={{ position: "relative" }}>
							<MetricChartSvg
								seriesWithFinitePoints={seriesWithFinitePoints}
								domain={domain}
								hiddenIndices={hiddenIndices}
								onHover={(timestamp, fraction) =>
									setHover({ timestamp, fraction })
								}
								onHoverEnd={() => setHover(null)}
								onZoomSelect={handleZoomSelect}
							/>
							{hover && (
								<MetricChartTooltip
									hover={hover}
									seriesWithFinitePoints={seriesWithFinitePoints}
									hiddenIndices={hiddenIndices}
								/>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}

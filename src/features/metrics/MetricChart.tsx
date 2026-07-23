import { type FormEvent, useEffect, useState } from "react";
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

const CUSTOM_RANGE_TARGET_POINT_COUNT = 300;
const CUSTOM_RANGE_MIN_STEP_SECONDS = 15;

function formatLabels(labels: Record<string, string>): string {
	return Object.entries(labels)
		.map(([key, value]) => `${key}="${value}"`)
		.join(", ");
}

function toFinitePoints(
	points: MetricRangePoint[],
): { timestamp: number; value: number }[] {
	return points
		.map((point) => ({
			timestamp: point.timestamp,
			value: Number.parseFloat(point.value),
		}))
		.filter((point) => Number.isFinite(point.value));
}

function MetricChartSvg({ series }: { series: MetricRangeSeries[] }) {
	const width = 600;
	const height = 200;
	const colors = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"];

	const seriesWithFinitePoints = series.map((oneSeries) => ({
		labels: oneSeries.labels,
		points: toFinitePoints(oneSeries.points),
	}));

	const allPoints = seriesWithFinitePoints.flatMap(
		(oneSeries) => oneSeries.points,
	);
	const timestamps = allPoints.map((point) => point.timestamp);
	const values = allPoints.map((point) => point.value);
	const minTimestamp = Math.min(...timestamps);
	const maxTimestamp = Math.max(...timestamps);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const timestampRange = maxTimestamp - minTimestamp || 1;
	const valueRange = maxValue - minValue || 1;

	return (
		<svg
			role="img"
			aria-label="Metric evolution chart"
			viewBox={`0 0 ${width} ${height}`}
			width={width}
			height={height}
		>
			{seriesWithFinitePoints.map((oneSeries, index) => {
				const pointsAttr = oneSeries.points
					.map((point) => {
						const x =
							((point.timestamp - minTimestamp) / timestampRange) * width;
						const y = height - ((point.value - minValue) / valueRange) * height;
						return `${x},${y}`;
					})
					.join(" ");

				return (
					<polyline
						// biome-ignore lint/suspicious/noArrayIndexKey: series have no stable identifier
						key={`${formatLabels(oneSeries.labels)}-${index}`}
						points={pointsAttr}
						fill="none"
						stroke={colors[index % colors.length]}
					/>
				);
			})}
		</svg>
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

	useEffect(() => {
		if (rangeOption === "custom" && !appliedCustomRange) {
			setState({ status: "idle" });
			return;
		}

		let cancelled = false;
		setState({ status: "loading" });

		let start: number;
		let end: number;
		let step: number;

		if (rangeOption === "custom" && appliedCustomRange) {
			start = Math.floor(new Date(appliedCustomRange.start).getTime() / 1000);
			end = Math.floor(new Date(appliedCustomRange.end).getTime() / 1000);
			step = Math.max(
				CUSTOM_RANGE_MIN_STEP_SECONDS,
				Math.round((end - start) / CUSTOM_RANGE_TARGET_POINT_COUNT),
			);
		} else {
			const range =
				PREDEFINED_RANGES[rangeOption as Exclude<RangeOption, "custom">];
			end = Math.floor(Date.now() / 1000);
			start = end - range.durationSeconds;
			step = range.stepSeconds;
		}

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

		return () => {
			cancelled = true;
		};
	}, [baseUrl, machine, metricName, rangeOption, appliedCustomRange]);

	function handleRangeOptionChange(value: RangeOption) {
		setRangeOption(value);
		setAppliedCustomRange(null);
	}

	function handleCustomRangeSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setAppliedCustomRange({ start: customStart, end: customEnd });
	}

	const hasData =
		state.status === "success" &&
		state.series.some((oneSeries) => oneSeries.points.length > 0);

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
				<MetricChartSvg series={state.series} />
			)}
		</div>
	);
}

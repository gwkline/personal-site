import { useState } from "react";

import type { ChallengeDay } from "@/lib/hard75";
import { REQUIREMENT_COUNT } from "@/lib/hard75";
import { cn } from "@/lib/utils";

type Anchor = readonly [number, number];

interface Point {
  x: number;
  y: number;
}

interface CurveSegment {
  controlOne: Point;
  controlTwo: Point;
  end: Point;
  start: Point;
}

const COURSE_ANCHORS: Anchor[] = [
  [48, 296],
  [126, 258],
  [164, 300],
  [202, 242],
  [246, 174],
  [320, 168],
  [370, 140],
  [408, 82],
  [474, 42],
  [450, 102],
  [416, 180],
  [436, 242],
  [398, 292],
  [370, 272],
];

const LAND_PATHS = {
  bronx:
    "M 446 58 C 460 31 486 18 516 25 C 538 30 548 47 536 63 C 520 79 489 84 463 74 C 453 70 447 65 446 58 Z",
  brooklynQueens:
    "M 108 257 C 118 225 143 207 172 202 C 195 192 202 163 229 148 C 264 128 315 125 356 118 C 382 114 400 126 397 146 C 393 168 360 178 344 202 C 320 238 282 260 254 289 C 229 316 198 331 163 324 C 128 316 103 288 108 257 Z",
  manhattan:
    "M 397 119 C 405 90 417 63 435 58 C 451 55 460 69 456 91 C 450 124 447 151 450 181 C 454 216 449 247 457 269 C 459 285 442 306 416 313 C 390 318 365 304 359 282 C 356 267 376 250 388 231 C 399 211 391 178 389 154 C 387 139 391 129 397 119 Z",
  newJersey:
    "M 0 20 L 151 20 C 132 45 121 76 103 107 C 82 144 64 184 38 215 C 23 233 10 241 0 244 Z",
  statenIsland:
    "M 10 284 C 21 259 46 248 68 254 C 91 260 104 278 96 299 C 88 320 61 331 36 325 C 13 319 2 303 10 284 Z",
} as const;

const point = ([x, y]: Anchor): Point => ({ x, y });

const buildCurveSegments = (anchors: Anchor[]): CurveSegment[] =>
  anchors.slice(0, -1).map((anchor, index) => {
    const previous = point(anchors[index - 1] ?? anchor);
    const start = point(anchor);
    const end = point(anchors[index + 1] ?? anchor);
    const next = point(anchors[index + 2] ?? anchors[index + 1] ?? anchor);
    const tension = 0.72 / 6;
    return {
      controlOne: {
        x: start.x + (end.x - previous.x) * tension,
        y: start.y + (end.y - previous.y) * tension,
      },
      controlTwo: {
        x: end.x - (next.x - start.x) * tension,
        y: end.y - (next.y - start.y) * tension,
      },
      end,
      start,
    };
  });

const curveSegments = buildCurveSegments(COURSE_ANCHORS);
const routePath = curveSegments
  .map((segment, index) => {
    const move = index === 0 ? `M ${segment.start.x} ${segment.start.y} ` : "";
    return `${move}C ${segment.controlOne.x} ${segment.controlOne.y}, ${segment.controlTwo.x} ${segment.controlTwo.y}, ${segment.end.x} ${segment.end.y}`;
  })
  .join(" ");

const pointOnCurve = (segment: CurveSegment, progress: number): Point => {
  const inverse = 1 - progress;
  const startWeight = inverse ** 3;
  const controlOneWeight = 3 * inverse ** 2 * progress;
  const controlTwoWeight = 3 * inverse * progress ** 2;
  const endWeight = progress ** 3;
  return {
    x:
      startWeight * segment.start.x +
      controlOneWeight * segment.controlOne.x +
      controlTwoWeight * segment.controlTwo.x +
      endWeight * segment.end.x,
    y:
      startWeight * segment.start.y +
      controlOneWeight * segment.controlOne.y +
      controlTwoWeight * segment.controlTwo.y +
      endWeight * segment.end.y,
  };
};

const routeSamples = curveSegments.flatMap((segment, segmentIndex) =>
  Array.from({ length: 25 }, (_, sampleIndex) => {
    if (segmentIndex > 0 && sampleIndex === 0) {
      return null;
    }
    return pointOnCurve(segment, sampleIndex / 24);
  }).filter((sample): sample is Point => sample !== null)
);

const sampleLengths = routeSamples.slice(1).map((sample, index) => {
  const previous = routeSamples[index] ?? sample;
  return Math.hypot(sample.x - previous.x, sample.y - previous.y);
});
const totalLength = sampleLengths.reduce((total, length) => total + length, 0);
const roundCoordinate = (value: number) => Number(value.toFixed(4));

const pointAtProgress = (progress: number): Point => {
  let remaining = Math.min(1, Math.max(0, progress)) * totalLength;
  for (let index = 0; index < sampleLengths.length; index += 1) {
    const length = sampleLengths[index] ?? 0;
    if (remaining <= length) {
      const start = routeSamples[index] ?? routeSamples[0];
      const end = routeSamples[index + 1] ?? start;
      if (!(start && end)) {
        break;
      }
      const ratio = length === 0 ? 0 : remaining / length;
      return {
        x: roundCoordinate(start.x + (end.x - start.x) * ratio),
        y: roundCoordinate(start.y + (end.y - start.y) * ratio),
      };
    }
    remaining -= length;
  }
  return routeSamples.at(-1) ?? { x: 370, y: 272 };
};

const getMarkerClass = (day: ChallengeDay) => {
  if (day.isFuture) {
    return "fill-background stroke-muted-foreground/35";
  }
  if (day.isComplete) {
    return "fill-info stroke-info";
  }
  if (day.completedCount > 0) {
    return "fill-chart-4 stroke-chart-4";
  }
  return "fill-muted stroke-muted-foreground/50";
};

const getMarkerLabel = (day: ChallengeDay) => {
  if (day.isFuture) {
    return "Upcoming";
  }
  if (day.isComplete) {
    return "Complete";
  }
  if (day.completedCount > 0) {
    return `${day.completedCount}/${REQUIREMENT_COUNT} complete`;
  }
  return "Unlogged";
};

const getTooltipPosition = (marker: Point | null) => {
  if (!marker) {
    return { x: 0, y: 0 };
  }
  return {
    x: marker.x > 390 ? marker.x - 122 : marker.x + 10,
    y: Math.max(marker.y - 16, 28),
  };
};

export const MarathonCourseGraphic = ({
  className,
  days,
  equivalentDays,
  onSelectDay,
}: {
  className?: string;
  days: ChallengeDay[];
  equivalentDays: number;
  onSelectDay?: (day: ChallengeDay) => void;
}) => {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const progress = Math.min(equivalentDays / 75, 1);
  const runner = pointAtProgress(progress);
  const hoveredDay = days.find((day) => day.dayIndex === hoveredDayIndex);
  const hoveredPoint = hoveredDay
    ? pointAtProgress((hoveredDay.dayIndex - 1) / 74)
    : null;
  const tooltip = getTooltipPosition(hoveredPoint);

  return (
    <svg
      aria-labelledby="course-map-title course-map-description"
      className={cn("w-full", className)}
      viewBox="0 20 540 310"
    >
      <title id="course-map-title">75-day challenge course</title>
      <desc id="course-map-description">
        A stylized New York City Marathon route. Select an elapsed day marker to
        open its log.
      </desc>
      <defs>
        <filter
          id="runner-shadow"
          height="300%"
          width="300%"
          x="-100%"
          y="-100%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            floodColor="currentColor"
            floodOpacity="0.2"
            stdDeviation="3"
          />
        </filter>
        <pattern
          height="18"
          id="water-grid"
          patternUnits="userSpaceOnUse"
          width="18"
        >
          <path
            className="stroke-muted-foreground/10"
            d="M 18 0 L 0 0 0 18"
            fill="none"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>

      <rect
        className="fill-foreground/2.5"
        height="310"
        rx="10"
        width="540"
        x="0"
        y="20"
      />
      <rect fill="url(#water-grid)" height="310" width="540" x="0" y="20" />

      <g
        className="fill-background/90 stroke-border/80"
        strokeLinejoin="round"
        strokeWidth="1"
      >
        <path d={LAND_PATHS.newJersey} />
        <path d={LAND_PATHS.statenIsland} />
        <path d={LAND_PATHS.brooklynQueens} />
        <path d={LAND_PATHS.manhattan} />
        <path d={LAND_PATHS.bronx} />
      </g>

      <path
        className="fill-primary/10 stroke-primary/30"
        d="M 365 262 C 372 257 386 256 394 261 L 395 297 C 387 303 374 304 366 299 Z"
        strokeWidth="1"
      />

      <g className="fill-muted-foreground font-mono text-[7px] uppercase tracking-[0.16em]">
        <text x="18" y="315">
          Staten Island
        </text>
        <text x="180" y="302">
          Brooklyn
        </text>
        <text x="290" y="206">
          Queens
        </text>
        <text x="485" y="50">
          Bronx
        </text>
        <text x="459" y="196">
          Manhattan
        </text>
      </g>

      <path
        className="fill-none stroke-background"
        d={routePath}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
      />
      <path
        className="fill-none stroke-muted-foreground/30"
        d={routePath}
        pathLength="100"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700 ease-in-out motion-reduce:transition-none"
        d={routePath}
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 - progress * 100}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />

      {days.map((day) => {
        const marker = pointAtProgress((day.dayIndex - 1) / 74);
        const isHovered = hoveredDayIndex === day.dayIndex;
        const isMilestone = day.dayIndex === 25 || day.dayIndex === 50;
        const isSelectable = Boolean(onSelectDay) && !day.isFuture;
        return (
          <g
            aria-label={
              isSelectable
                ? `Open day ${day.dayIndex}: ${getMarkerLabel(day)}`
                : undefined
            }
            className={cn(isSelectable ? "cursor-pointer" : "cursor-default")}
            key={day.dayIndex}
            onClick={isSelectable ? () => onSelectDay?.(day) : undefined}
            onBlur={() => setHoveredDayIndex(null)}
            onFocus={() => setHoveredDayIndex(day.dayIndex)}
            onKeyDown={
              isSelectable
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectDay?.(day);
                    }
                  }
                : undefined
            }
            onPointerEnter={() => setHoveredDayIndex(day.dayIndex)}
            onPointerLeave={() => setHoveredDayIndex(null)}
            role={isSelectable ? "button" : undefined}
            tabIndex={isSelectable ? 0 : undefined}
          >
            <circle
              className="fill-transparent"
              cx={marker.x}
              cy={marker.y}
              r="7"
            />
            {isHovered ? (
              <circle
                className="fill-primary/15 stroke-primary/30"
                cx={marker.x}
                cy={marker.y}
                r="7"
              />
            ) : null}
            <circle
              className={cn(
                "pointer-events-none transition-[fill,stroke] duration-150 ease-out motion-reduce:transition-none",
                getMarkerClass(day),
                day.isToday && "stroke-foreground"
              )}
              cx={marker.x}
              cy={marker.y}
              r={day.isToday || isMilestone ? 3.4 : 2}
              strokeWidth={day.isToday ? 1.6 : 0.8}
            />
          </g>
        );
      })}

      <g
        className="pointer-events-none text-primary transition-transform duration-700 ease-in-out will-change-transform motion-reduce:transition-none"
        filter="url(#runner-shadow)"
        style={{ transform: `translate(${runner.x}px, ${runner.y}px)` }}
      >
        <circle
          className={cn(
            "origin-center fill-current opacity-20 transform-fill motion-reduce:hidden",
            hoveredDay ? "hidden" : "animate-ping"
          )}
          r="8"
        />
        <circle
          className="fill-background stroke-current"
          r="8"
          strokeWidth="2"
        />
        <circle className="fill-current" r="3" />
      </g>

      <g className="fill-muted-foreground font-mono text-[7px] uppercase tracking-wider">
        <circle className="fill-primary" cx="48" cy="296" r="3" />
        <text x="16" y="285">
          Start
        </text>
        <circle className="fill-foreground" cx="370" cy="272" r="3" />
        <text x="341" y="263">
          Finish
        </text>
      </g>

      {hoveredDay && hoveredPoint ? (
        <g
          className="pointer-events-none"
          transform={`translate(${tooltip.x} ${tooltip.y})`}
        >
          <rect className="fill-foreground" height="27" rx="7" width="112" />
          <text className="fill-background font-mono text-[8px]" x="8" y="17">
            Day {hoveredDay.dayIndex} · {getMarkerLabel(hoveredDay)}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

import { useMemo, useState } from "react";
import "./ActivityChart.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ActivityChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // No activity source is connected yet, so every day has zero
  // recorded contributions. This avoids displaying fabricated data.
  const { weeks, monthLabels, totalContributions } = useMemo(() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    const days = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const day = new Date(date);

      days.push({
        date: day,
        count: 0,
        key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
      });
    }

    const paddedDays = [
      ...Array(start.getDay()).fill(null),
      ...days,
    ];

    while (paddedDays.length % 7 !== 0) {
      paddedDays.push(null);
    }

    const groupedWeeks = [];

    for (let i = 0; i < paddedDays.length; i += 7) {
      groupedWeeks.push(paddedDays.slice(i, i + 7));
    }

   
      // Place each month above its actual week in the year.
      const labels = [];

      for (let month = 0; month < 12; month++) {
        const firstDay = new Date(selectedYear, month, 1);

        const daysFromStart = Math.round(
          (firstDay.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const weekIndex = Math.floor(
          (daysFromStart + start.getDay()) / 7
        );

        labels.push({
          text: MONTHS[month],
          index: weekIndex,
        });
      }


    return {
      weeks: groupedWeeks,
      monthLabels: labels,
      totalContributions: 0,
    };
  }, [selectedYear]);

  const availableYears = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  );

  return (
    <section className="activity-chart">
      <div className="activity-chart-header">
        <div className="activity-chart-title">
          <h2>
            {totalContributions} contributions
            <span> in {selectedYear}</span>
          </h2>
          <p>Your coding activity throughout the year</p>
        </div>

        <label className="activity-year-select">
          <span className="sr-only">Select activity year</span>
          <select
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(Number(event.target.value))
            }
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="activity-chart-card">
        <div className="activity-calendar">
          <div
  className="activity-months"
  style={{
    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
  }}
  aria-hidden="true"
>
            {monthLabels.map((month) => (
              <span
                key={month.text}
                style={{ gridColumn: month.index + 1 }}
              >
                {month.text}
              </span>
            ))}
          </div>

          <div className="activity-chart-body">
            <div className="activity-weekdays" aria-hidden="true">
              {WEEKDAYS.map((day, index) => (
                <span key={day}>
                  {index % 2 === 1 && index < 6 ? day : ""}
                </span>
              ))}
            </div>

            <div className="activity-weeks">
              {weeks.map((week, weekIndex) => (
                <div className="activity-week" key={weekIndex}>
                  {week.map((day, dayIndex) =>
                    day ? (
                      <span
                        key={day.key}
                        className="activity-day level-0"
                        title={`No recorded contributions on ${formatDate(day.date)}`}
                        aria-label={`No recorded contributions on ${formatDate(day.date)}`}
                      />
                    ) : (
                      <span
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="activity-day activity-day-empty"
                        aria-hidden="true"
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="activity-chart-footer">
          <p className="activity-detail">
            Activity tracking isn't connected yet.
          </p>

          <div className="activity-legend">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={`activity-day level-${level}`}
                aria-hidden="true"
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <p className="activity-demo-note">
        Only recorded coding activity will appear here once tracking is implemented.
      </p>
    </section>
  );
}
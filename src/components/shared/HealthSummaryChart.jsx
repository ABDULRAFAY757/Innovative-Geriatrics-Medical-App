import { useState, useMemo } from 'react';
import { Card } from './UIComponents';
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Health Summary Chart Component
 * Displays weekly health metrics with visual charts
 * - Blood Pressure (1 week)
 * - Sleep Quality (1 week)
 * - Medication Adherence (1 week)
 */
const HealthSummaryChart = ({ patient, language = 'en' }) => {
  const isRTL = language === 'ar';
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');

  // Generate mock weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.setDate() - i);
      days.push({
        date: date,
        day: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
      });
    }

    return {
      bloodPressure: days.map((day, i) => ({
        ...day,
        systolic: 135 + Math.floor(Math.random() * 15) - 7,
        diastolic: 85 + Math.floor(Math.random() * 10) - 5,
      })),
      sleepQuality: days.map((day, i) => ({
        ...day,
        hours: 6 + Math.random() * 2,
        quality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
        qualityScore: 60 + Math.floor(Math.random() * 40),
      })),
      medicationAdherence: days.map((day, i) => ({
        ...day,
        taken: Math.floor(Math.random() * 3) + 2,
        total: 3,
        percentage: ((Math.floor(Math.random() * 3) + 2) / 3) * 100,
      })),
    };
  }, [language]);

  const metrics = [
    {
      id: 'bloodPressure',
      name: language === 'ar' ? 'ضغط الدم' : 'Blood Pressure',
      icon: Heart,
      color: 'blue',
      unit: 'mmHg',
    },
    {
      id: 'sleepQuality',
      name: language === 'ar' ? 'جودة النوم' : 'Sleep Quality',
      icon: Moon,
      color: 'purple',
      unit: 'hours',
    },
    {
      id: 'medicationAdherence',
      name: language === 'ar' ? 'الالتزام بالدواء' : 'Medication Adherence',
      icon: Droplet,
      color: 'green',
      unit: '%',
    },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);
  const currentData = weeklyData[selectedMetric];

  // Calculate averages and trends
  const getStats = () => {
    if (selectedMetric === 'bloodPressure') {
      const avgSystolic = currentData.reduce((sum, d) => sum + d.systolic, 0) / currentData.length;
      const avgDiastolic = currentData.reduce((sum, d) => sum + d.diastolic, 0) / currentData.length;
      const trend = currentData[currentData.length - 1].systolic > currentData[0].systolic ? 'up' : 'down';
      return {
        average: `${Math.round(avgSystolic)}/${Math.round(avgDiastolic)}`,
        trend,
        status: avgSystolic < 140 && avgDiastolic < 90 ? 'good' : 'warning',
      };
    } else if (selectedMetric === 'sleepQuality') {
      const avgHours = currentData.reduce((sum, d) => sum + d.hours, 0) / currentData.length;
      const avgQuality = currentData.reduce((sum, d) => sum + d.qualityScore, 0) / currentData.length;
      const trend = currentData[currentData.length - 1].hours > currentData[0].hours ? 'up' : 'down';
      return {
        average: avgHours.toFixed(1),
        trend,
        status: avgHours >= 7 ? 'good' : 'warning',
      };
    } else {
      const avgAdherence = currentData.reduce((sum, d) => sum + d.percentage, 0) / currentData.length;
      const trend = currentData[currentData.length - 1].percentage > currentData[0].percentage ? 'up' : 'down';
      return {
        average: avgAdherence.toFixed(0),
        trend,
        status: avgAdherence >= 80 ? 'good' : 'warning',
      };
    }
  };

  const stats = getStats();

  const getTrendIcon = (trend) => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon(stats.trend);

  return (
    <Card>
      <div className={clsx('p-6', isRTL && 'rtl')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'ملخص الصحة الأسبوعي' : 'Weekly Health Summary'}
          </h3>
        </div>

        {/* Metric Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isActive = selectedMetric === metric.id;

            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                  isActive
                    ? `bg-${metric.color}-100 text-${metric.color}-700 border-2 border-${metric.color}-500`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {metric.name}
              </button>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'المتوسط' : 'Average'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.average}
              <span className="text-sm font-normal text-gray-600 ml-1">
                {currentMetric.unit}
              </span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'الاتجاه' : 'Trend'}
            </p>
            <div className="flex items-center gap-2">
              <TrendIcon className={clsx(
                'w-6 h-6',
                stats.trend === 'up' ? 'text-blue-600' : 'text-orange-600'
              )} />
              <span className="text-lg font-semibold text-gray-900">
                {stats.trend === 'up'
                  ? (language === 'ar' ? 'صاعد' : 'Rising')
                  : (language === 'ar' ? 'هابط' : 'Falling')
                }
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'ar' ? 'الحالة' : 'Status'}
            </p>
            <div className={clsx(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
              stats.status === 'good'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            )}>
              <Activity className="w-4 h-4" />
              {stats.status === 'good'
                ? (language === 'ar' ? 'جيد' : 'Good')
                : (language === 'ar' ? 'يحتاج متابعة' : 'Needs Attention')
              }
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
          </h4>

          {selectedMetric === 'bloodPressure' && (
            <div className="space-y-2">
              {currentData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {/* Systolic Bar */}
                    <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end pr-2"
                        style={{ width: `${(day.systolic / 180) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {day.systolic}
                        </span>
                      </div>
                    </div>
                    {/* Diastolic Bar */}
                    <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2"
                        style={{ width: `${(day.diastolic / 120) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {day.diastolic}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  {language === 'ar' ? 'الانقباضي' : 'Systolic'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  {language === 'ar' ? 'الانبساطي' : 'Diastolic'}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'sleepQuality' && (
            <div className="space-y-2">
              {currentData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-end pr-2"
                      style={{ width: `${(day.hours / 10) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {day.hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                  <div className={clsx(
                    'w-20 text-xs font-semibold text-center px-2 py-1 rounded',
                    day.quality === 'Excellent' && 'bg-green-100 text-green-700',
                    day.quality === 'Good' && 'bg-blue-100 text-blue-700',
                    day.quality === 'Fair' && 'bg-yellow-100 text-yellow-700',
                    day.quality === 'Poor' && 'bg-red-100 text-red-700'
                  )}>
                    {language === 'ar'
                      ? { Excellent: 'ممتاز', Good: 'جيد', Fair: 'مقبول', Poor: 'ضعيف' }[day.quality]
                      : day.quality
                    }
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedMetric === 'medicationAdherence' && (
            <div className="space-y-2">
              {currentData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={clsx(
                        'absolute inset-y-0 left-0 flex items-center justify-end pr-2',
                        day.percentage >= 80
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      )}
                      style={{ width: `${day.percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {day.taken}/{day.total}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                    {day.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default HealthSummaryChart;

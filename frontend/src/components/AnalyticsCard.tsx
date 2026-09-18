import { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor: string;
  bgColor: string;
  animationDelay: string;
}

const AnalyticsCard = memo(({ 
  icon: Icon, 
  label, 
  value, 
  iconColor, 
  bgColor,
  animationDelay 
}: AnalyticsCardProps) => {
  return (
    <div className="card-ios p-6 animate-slide-up" style={{ animationDelay }}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className="text-sm text-foreground/60">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
});

AnalyticsCard.displayName = 'AnalyticsCard';

export default AnalyticsCard;
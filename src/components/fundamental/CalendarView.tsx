import React from 'react';
import { EconomicCalendarTab } from '../tabs/EconomicCalendarTab';
import { MarketState } from '../../hooks/useMarketState';

interface CalendarViewProps {
  state: MarketState;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ state }) => {
  return <EconomicCalendarTab state={state} />;
};

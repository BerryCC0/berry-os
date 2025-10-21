/**
 * DatePicker Component
 * Mac OS 8-styled date picker with calendar grid
 * Conforms to comprehensive theme system
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './DatePicker.module.css';

export interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  disabled?: boolean;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  disabled = false,
  minDate,
  maxDate,
  placeholder = 'Select date...',
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse value to Date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calendar grid logic
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    // Validate against min/max
    if (minDate && dateString < minDate) return;
    if (maxDate && dateString > maxDate) return;
    
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div ref={pickerRef} className={`${styles.datePicker} ${className}`}>
      <button
        type="button"
        className={styles.dateButton}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {value ? formatDisplayDate(value) : <span className={styles.placeholder}>{placeholder}</span>}
        <span className={styles.icon}>📅</span>
      </button>

      {isOpen && (
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.navButton} onClick={handlePrevMonth}>◀</button>
            <span className={styles.monthYear}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" className={styles.navButton} onClick={handleNextMonth}>▶</button>
          </div>
          
          <div className={styles.weekdays}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>
          
          <div className={styles.days}>
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className={styles.emptyDay} />;
              
              const year = viewDate.getFullYear();
              const month = String(viewDate.getMonth() + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const dateString = `${year}-${month}-${dayStr}`;
              
              const isSelected = value === dateString;
              const isDisabled = Boolean((minDate && dateString < minDate) || (maxDate && dateString > maxDate));
              
              return (
                <button
                  key={day}
                  type="button"
                  className={`${styles.day} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


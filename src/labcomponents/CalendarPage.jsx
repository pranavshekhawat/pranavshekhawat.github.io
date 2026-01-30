import React, { useState, useEffect } from 'react';
import { subscribeToUserCollection } from '../utils/userDataHelper';
import LabNavbar from './LabNavbar';

/**
 * CalendarPage - Visual calendar for batch planning and curing timeline
 * Route: /lab/calendar
 */

const BATCH_COLORS = {
  planned: '#9e9e9e',
  in_progress: '#2196f3',
  curing: '#ff9800',
  testing: '#9c27b0',
  ready: '#4caf50',
  sold: '#795548',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarPage() {
  const [batches, setBatches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month or timeline

  useEffect(() => {
    const unsubs = [];
    try {
      unsubs.push(subscribeToUserCollection('batches', (data) => {
        // Sort by createdAt descending
        const sorted = [...data].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setBatches(sorted);
      }));
      unsubs.push(subscribeToUserCollection('recipes', (data) => {
        setRecipes(data);
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return () => unsubs.forEach(u => u());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    
    const events = [];
    
    batches.forEach(batch => {
      // Made date
      if (batch.madeDate === dateStr) {
        events.push({
          type: 'made',
          batch,
          label: `Made: ${batch.name || batch.recipeName}`,
          color: '#4caf50',
        });
      }
      
      // Ready date (6 weeks after made)
      if (batch.madeDate) {
        const madeDate = new Date(batch.madeDate);
        const readyDate = new Date(madeDate);
        readyDate.setDate(readyDate.getDate() + 42);
        if (readyDate.toISOString().split('T')[0] === dateStr) {
          events.push({
            type: 'ready',
            batch,
            label: `Ready: ${batch.name || batch.recipeName}`,
            color: '#ff9800',
          });
        }
      }
    });
    
    return events;
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Timeline view - next 8 weeks
  const getTimelineData = () => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let w = 0; w < 8; w++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (w * 7));
      
      const weekBatches = batches.filter(batch => {
        if (!batch.madeDate) return false;
        const madeDate = new Date(batch.madeDate);
        const readyDate = new Date(madeDate);
        readyDate.setDate(readyDate.getDate() + 42);
        
        // Check if this batch is curing during this week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return madeDate <= weekEnd && readyDate >= weekStart;
      });
      
      weeks.push({
        weekStart,
        batches: weekBatches,
      });
    }
    
    return weeks;
  };

  const timelineData = getTimelineData();

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      {/* Page Title */}
      <h2 style={{ margin: '0 0 16px', fontSize: '1.3em' }}>📅 Batch Calendar</h2>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setView('month')}
          style={{
            padding: '10px 20px',
            background: view === 'month' ? '#1976d2' : '#f5f5f5',
            color: view === 'month' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          📆 Month View
        </button>
        <button
          onClick={() => setView('timeline')}
          style={{
            padding: '10px 20px',
            background: view === 'timeline' ? '#1976d2' : '#f5f5f5',
            color: view === 'timeline' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          📊 Timeline View
        </button>
      </div>

      {view === 'month' ? (
        <>
          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1.1em' }}>
              ← Previous
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h3 style={{ margin: 0 }}>{MONTHS[month]} {year}</h3>
              <button onClick={goToToday} style={{ padding: '8px 16px', background: '#e3f2fd', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Today
              </button>
            </div>
            <button onClick={nextMonth} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1.1em' }}>
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: '#e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
            {/* Day headers */}
            {DAYS.map(day => (
              <div key={day} style={{ padding: 12, background: '#f5f5f5', textAlign: 'center', fontWeight: 600, fontSize: '0.9em' }}>
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: 12, background: '#fafafa', minHeight: 90 }} />
            ))}

            {/* Days of month */}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDate(day);
              const today = isToday(day);
              const isSelected = selectedDate === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  style={{
                    padding: 8,
                    background: isSelected ? '#e3f2fd' : '#fff',
                    minHeight: 90,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: today ? '#1976d2' : 'transparent',
                    color: today ? '#fff' : '#333',
                    fontWeight: today ? 700 : 400,
                    fontSize: '0.9em',
                  }}>
                    {day}
                  </div>

                  {/* Event dots */}
                  <div style={{ marginTop: 4 }}>
                    {events.slice(0, 3).map((event, ei) => (
                      <div
                        key={ei}
                        style={{
                          padding: '2px 6px',
                          background: event.color,
                          color: '#fff',
                          borderRadius: 4,
                          fontSize: '0.7em',
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {event.type === 'made' ? '🆕' : '✅'} {event.batch.name?.substring(0, 15) || 'Batch'}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div style={{ fontSize: '0.7em', color: '#666' }}>+{events.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div style={{ marginTop: 20, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 12px' }}>
                {MONTHS[month]} {selectedDate}, {year}
              </h4>
              {selectedDateEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDateEvents.map((event, i) => (
                    <div key={i} style={{ padding: 12, background: '#fff', borderRadius: 6, borderLeft: `4px solid ${event.color}` }}>
                      <div style={{ fontWeight: 600 }}>{event.label}</div>
                      <div style={{ fontSize: '0.85em', color: '#666', marginTop: 4 }}>
                        {event.batch.bars || '?'} bars • Status: {event.batch.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#666' }}>No events on this date</div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Timeline View */
        <div>
          <h3 style={{ marginBottom: 16 }}>Next 8 Weeks - Curing Timeline</h3>
          
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#4caf50', borderRadius: 4 }} />
              <span style={{ fontSize: '0.85em' }}>Week 1-2 (early cure)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#ff9800', borderRadius: 4 }} />
              <span style={{ fontSize: '0.85em' }}>Week 3-4 (mid cure)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: '#2196f3', borderRadius: 4 }} />
              <span style={{ fontSize: '0.85em' }}>Week 5-6 (almost ready)</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(120px, 1fr))', gap: 2, minWidth: 800 }}>
              {/* Week headers */}
              {timelineData.map((week, i) => (
                <div key={i} style={{ padding: 10, background: '#f5f5f5', textAlign: 'center', fontWeight: 600, fontSize: '0.85em' }}>
                  Week {i + 1}
                  <div style={{ fontSize: '0.8em', fontWeight: 400, color: '#666' }}>
                    {week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}

              {/* Batch rows */}
              {batches.filter(b => b.madeDate && b.status === 'curing').map(batch => {
                const madeDate = new Date(batch.madeDate);
                const readyDate = new Date(madeDate);
                readyDate.setDate(readyDate.getDate() + 42);
                const today = new Date();

                return timelineData.map((week, wi) => {
                  const weekEnd = new Date(week.weekStart);
                  weekEnd.setDate(weekEnd.getDate() + 6);
                  
                  const isInRange = madeDate <= weekEnd && readyDate >= week.weekStart;
                  if (!isInRange) {
                    return <div key={`${batch.id}-${wi}`} style={{ padding: 8, background: '#fff' }} />;
                  }

                  // Calculate cure week (1-6)
                  const daysSinceMade = Math.floor((week.weekStart - madeDate) / (1000 * 60 * 60 * 24));
                  const cureWeek = Math.ceil(daysSinceMade / 7) + 1;
                  
                  let color = '#4caf50';
                  if (cureWeek >= 3) color = '#ff9800';
                  if (cureWeek >= 5) color = '#2196f3';

                  return (
                    <div
                      key={`${batch.id}-${wi}`}
                      style={{
                        padding: 8,
                        background: color,
                        color: '#fff',
                        fontSize: '0.8em',
                        borderRadius: 4,
                        margin: 2,
                      }}
                    >
                      {batch.name?.substring(0, 12) || 'Batch'}
                      <div style={{ fontSize: '0.85em', opacity: 0.9 }}>Week {cureWeek}</div>
                    </div>
                  );
                });
              })}
            </div>
          </div>

          {/* Upcoming Ready Dates */}
          <div style={{ marginTop: 24 }}>
            <h4>🎉 Upcoming Ready Dates</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12, marginTop: 12 }}>
              {batches
                .filter(b => b.madeDate && b.status === 'curing')
                .map(batch => {
                  const madeDate = new Date(batch.madeDate);
                  const readyDate = new Date(madeDate);
                  readyDate.setDate(readyDate.getDate() + 42);
                  const daysLeft = Math.ceil((readyDate - new Date()) / (1000 * 60 * 60 * 24));
                  
                  if (daysLeft < 0) return null;
                  
                  return (
                    <div key={batch.id} style={{ padding: 12, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8 }}>
                      <div style={{ fontWeight: 600 }}>{batch.name || batch.recipeName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.9em', color: '#666' }}>
                        <span>Ready: {readyDate.toLocaleDateString()}</span>
                        <span style={{ color: daysLeft <= 7 ? '#4caf50' : '#ff9800', fontWeight: 500 }}>
                          {daysLeft} days left
                        </span>
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)
                .sort((a, b) => a?.props?.children?.[1]?.props?.children?.[1] - b?.props?.children?.[1]?.props?.children?.[1])
              }
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default CalendarPage;

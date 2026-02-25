import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Calculator, Cake, Hourglass, Info, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner, Banner728x90 } from '../components/Layout';

interface AgeStats {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: {
    daysToGo: number;
    monthsToGo: number;
    dayOfWeek: string;
    dateStr: string;
    turningAge: number;
  };
}

const AgeCalculator: React.FC = () => {
  // Default to today for target, empty for birth
  const [birthDate, setBirthDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [stats, setStats] = useState<AgeStats | null>(null);

  const calculateAge = () => {
    if (!birthDate || !targetDate) return;

    const start = new Date(birthDate);
    const end = new Date(targetDate);

    // Validation
    if (start > end) {
      return;
    }

    // 1. Basic Chronological Age (Y/M/D)
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // 2. Totals
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalSeconds = Math.floor(diffTime / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;

    // 3. Next Birthday Calculation
    const currentYear = end.getFullYear();
    let nextBday = new Date(currentYear, start.getMonth(), start.getDate());
    
    if (nextBday.getTime() < end.getTime()) {
      nextBday.setFullYear(currentYear + 1);
    }
    
    let monthsToGo = 0;
    let tempDate = new Date(end);
    
    while(monthsToGo < 13) {
        let nextMonthTest = new Date(tempDate);
        nextMonthTest.setMonth(nextMonthTest.getMonth() + 1);
        
        if (nextMonthTest.getDate() !== tempDate.getDate()) {
            nextMonthTest.setDate(0); 
        }

        if (nextMonthTest <= nextBday) {
            monthsToGo++;
            tempDate = nextMonthTest;
        } else {
            break;
        }
    }

    const diffTimeRem = Math.abs(nextBday.getTime() - tempDate.getTime());
    const daysToGo = Math.ceil(diffTimeRem / (1000 * 60 * 60 * 24));

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nextBdayDayOfWeek = daysOfWeek[nextBday.getDay()];

    setStats({
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday: {
        daysToGo,
        monthsToGo,
        dayOfWeek: nextBdayDayOfWeek,
        dateStr: nextBday.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
        turningAge: years + 1
      }
    });
  };

  useEffect(() => {
    if (birthDate && targetDate) {
      calculateAge();
    }
  }, [birthDate, targetDate]);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Calculator size={120} />
        </div>
        <div className="relative z-10">
           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
             Advanced Age Calculator
           </h1>
           <p className="text-lg text-gray-500 max-w-2xl">
             Calculate your exact age, find out your next birthday down to the second, and explore a detailed timeline of your life.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
             <div className="flex items-center gap-2 mb-2 font-bold text-gray-800 border-b border-gray-100 pb-2">
               <Calendar className="text-chrome-blue" size={20} /> Date Settings
             </div>
             
             <div>
               <label className="block text-sm font-semibold text-gray-600 mb-2">Date of Birth</label>
               <input 
                 type="date" 
                 value={birthDate}
                 onChange={(e) => setBirthDate(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chrome-blue focus:border-chrome-blue outline-none transition-all font-medium text-gray-800"
               />
             </div>

             <div className="relative">
                <div className="absolute -left-3 top-[-12px] bg-white p-1 rounded-full border border-gray-200 text-gray-400 z-10">
                   <Hourglass size={14} />
                </div>
                <div className="border-l-2 border-dashed border-gray-200 ml-[-20px] pl-[20px] h-6"></div>
             </div>

             <div>
               <label className="block text-sm font-semibold text-gray-600 mb-2">Calculate Age At (Target Date)</label>
               <input 
                 type="date" 
                 value={targetDate}
                 onChange={(e) => setTargetDate(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chrome-blue focus:border-chrome-blue outline-none transition-all font-medium text-gray-800"
               />
             </div>
          </div>

          {stats && (
            <div className="bg-gradient-to-br from-chrome-blue to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
               <div className="relative z-10 text-center">
                 <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Chronological Age</p>
                 <div className="text-6xl font-extrabold mb-1">{stats.years}</div>
                 <div className="text-xl font-medium text-blue-100 mb-6">Years Old</div>
                 
                 <div className="flex justify-center gap-4 border-t border-white/20 pt-4">
                    <div>
                       <span className="block text-2xl font-bold">{stats.months}</span>
                       <span className="text-xs text-blue-200 uppercase">Months</span>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div>
                       <span className="block text-2xl font-bold">{stats.days}</span>
                       <span className="text-xs text-blue-200 uppercase">Days</span>
                    </div>
                 </div>
               </div>
               <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
           {stats ? (
             <>
               <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm flex-shrink-0">
                           <Cake size={32} />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-gray-900">Next Birthday</h3>
                           <p className="text-gray-600 text-sm">Turning <span className="font-bold text-pink-600">{stats.nextBirthday.turningAge}</span> on {stats.nextBirthday.dateStr}</p>
                           <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-purple-600 bg-white px-3 py-1 rounded-full w-fit shadow-sm">
                              <Calendar size={12} /> {stats.nextBirthday.dayOfWeek}
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-3 text-center">
                        <div className="bg-white px-4 py-3 rounded-xl shadow-sm min-w-[80px]">
                           <div className="text-2xl font-bold text-gray-800">{stats.nextBirthday.monthsToGo}</div>
                           <div className="text-[10px] text-gray-500 uppercase font-bold">Months</div>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-xl shadow-sm min-w-[80px]">
                           <div className="text-2xl font-bold text-gray-800">{stats.nextBirthday.daysToGo}</div>
                           <div className="text-[10px] text-gray-500 uppercase font-bold">Days</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Clock className="text-chrome-blue" size={20} />
                     Time Alive Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <StatCard label="Total Months" value={stats.totalMonths.toLocaleString()} />
                     <StatCard label="Total Weeks" value={stats.totalWeeks.toLocaleString()} />
                     <StatCard label="Total Days" value={stats.totalDays.toLocaleString()} />
                     <StatCard label="Total Hours" value={stats.totalHours.toLocaleString()} />
                     <StatCard label="Total Minutes" value={stats.totalMinutes.toLocaleString()} />
                     <StatCard label="Total Seconds" value={stats.totalSeconds.toLocaleString()} highlight />
                  </div>
               </div>
             </>
           ) : (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <Gift className="text-chrome-blue mb-6 animate-bounce-slow" size={40} />
               <h3 className="text-xl font-bold text-gray-700 mb-2">Waiting for Input</h3>
               <p className="max-w-md text-center text-gray-500">Enter your Date of Birth on the left.</p>
             </div>
           )}
        </div>
      </div>
      
      <AdBanner />

      <article className="prose prose-lg max-w-none text-gray-600 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">The Ultimate Guide to Age Calculation: More Than Just Numbers</h2>
        
        <p className="lead text-xl text-gray-500 mb-8">
          Have you ever wondered exactly how many seconds you've been alive? Or wanted to know the exact day of the week your next milestone birthday falls on? 
          FileMakerOn's <strong>Advanced Age Calculator</strong> goes beyond the basics to provide a comprehensive analysis of your chronological timeline.
        </p>

        <Banner728x90 />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
           <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                 <CheckCircle className="text-blue-600" size={20} /> Why Calculate Exact Age?
              </h3>
              <p className="text-sm">
                 Knowing your age in days or weeks isn't just trivia. It's used in medical diagnostics, legal documentation, 
                 financial planning, and even astrology. Our tool provides precision down to the second.
              </p>
           </div>
           <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                 <Sparkles className="text-purple-600" size={20} /> The Leap Year Factor
              </h3>
              <p className="text-sm">
                 A standard year is 365 days, but a solar year is actually 365.2425 days. Every 4 years, we add a day (Feb 29). 
                 Our algorithm accounting for every leap year in your lifespan ensures accuracy.
              </p>
           </div>
        </div>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Chronological vs. Biological Age</h3>
        <p>
          This tool calculates your <strong>Chronological Age</strong>—the amount of time that has passed from your birth to a given date. 
          It is defined by the calendar and is the primary metric for legal purposes.
        </p>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How the "Next Birthday" Calculation Works</h3>
        <p>
          Our unique "Next Birthday" feature doesn't just tell you the date. It calculates the countdown, day of the week, and turning age automatically.
        </p>

        <Banner728x90 />
      </article>
      
      <RelatedTools />
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
   <div className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${highlight ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-200'}`}>
      <p className="text-xs text-gray-500 uppercase font-bold mb-1">{label}</p>
      <p className={`text-2xl font-bold truncate ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
   </div>
);

export default AgeCalculator;
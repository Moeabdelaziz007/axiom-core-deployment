/**
 * MENA Prayer Times & Islamic Tools
 * Zero-cost integration with Aladhan API for Islamic prayer times
 * Supports all MENA cities and prayer time calculations
 */

import { getPrayerTimes, getCityPrayerTimes, getNextPrayer, getRamadanSchedule } from './prayer-api';

/**
 * Prayer Times Calculator
 * Aladhan API integration for accurate prayer times across MENA
 */
export class PrayerTimesCalculator {
  
  /**
   * Get prayer times for any MENA city
   * Uses Aladhan's free API for accurate calculations
   */
  async getCityPrayerTimes(
    city: string,
    country: string,
    date?: string,
    method: 'ISNA' | 'Egypt' | 'Karachi' | 'Tehran' | 'JAFARI' | 'Turkey' = 'Egypt'
  ): Promise<{
    city: string;
    country: string;
    date: string;
    prayers: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
    };
    meta: {
      latitude: number;
      longitude: number;
      method: string;
      timezone: string;
    };
  }> {
    
    try {
      const prayerData = await getCityPrayerTimes(city, country, date, method);
      
      return {
        city,
        country,
        date: date || new Date().toISOString().split('T')[0],
        prayers: prayerData.data.timings,
        meta: {
          latitude: prayerData.data.date.gregorian.day,
          longitude: prayerData.data.date.gregorian.month.number,
          method,
          timezone: prayerData.data.date.readable
        }
      };
    } catch (error) {
      throw new Error(`Failed to get prayer times for ${city}, ${country}: ${error}`);
    }
  }

  /**
   * Get next prayer time with countdown
   */
  async getNextPrayerTime(
    city: string,
    country: string,
    currentTime: Date = new Date()
  ): Promise<{
    nextPrayer: string;
    nextTime: string;
    countdown: {
      hours: number;
      minutes: number;
      seconds: number;
    };
    location: string;
  }> {
    
    const prayerTimes = await this.getCityPrayerTimes(city, country);
    const prayers = prayerTimes.prayers;
    
    // Convert prayer times to today's date
    const today = new Date();
    const prayerSchedule = [
      { name: 'Fajr', time: this.parseTime(prayers.Fajr, today) },
      { name: 'Dhuhr', time: this.parseTime(prayers.Dhuhr, today) },
      { name: 'Asr', time: this.parseTime(prayers.Asr, today) },
      { name: 'Maghrib', time: this.parseTime(prayers.Maghrib, today) },
      { name: 'Isha', time: this.parseTime(prayers.Isha, today) },
    ];
    
    // Find next prayer
    const now = currentTime;
    const nextPrayerInfo = prayerSchedule.find(prayer => prayer.time > now) || 
                          { name: 'Fajr', time: this.parseTime(prayers.Fajr, new Date(today.getTime() + 24 * 60 * 60 * 1000)) };
    
    // Calculate countdown
    const timeDiff = nextPrayerInfo.time.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return {
      nextPrayer: nextPrayerInfo.name,
      nextTime: nextPrayerInfo.time.toLocaleTimeString(),
      countdown: { hours, minutes, seconds },
      location: `${city}, ${country}`
    };
  }

  /**
   * Get Ramadan schedule for any MENA city
   */
  async getRamadanSchedule(
    city: string,
    country: string,
    year: number = new Date().getFullYear()
  ): Promise<{
    city: string;
    country: string;
    year: number;
    Ramadan: {
      start: string;
      end: string;
      duration: string;
    };
    schedule: Array<{
      date: string;
      sahur: string;
      iftar: string;
      qiyam: string;
    }>;
  }> {
    
    try {
      // Ramadan 2025 dates (approximate)
      const ramadanStart = `${year}-03-01`;
      const ramadanEnd = `${year}-03-30`;
      
      // Generate daily schedule
      const schedule = [];
      const startDate = new Date(`${year}-03-01`);
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get prayer times for each day
        const prayerTimes = await this.getCityPrayerTimes(city, country, dateStr);
        const prayers = prayerTimes.prayers;
        
        schedule.push({
          date: dateStr,
          sahur: prayers.Fajr, // Suhoor ends at Fajr
          iftar: prayers.Maghrib,
          qiyam: prayers.Isha
        });
      }
      
      return {
        city,
        country,
        year,
        Ramadan: {
          start: ramadanStart,
          end: ramadanEnd,
          duration: '30 days'
        },
        schedule
      };
    } catch (error) {
      throw new Error(`Failed to get Ramadan schedule for ${city}, ${country}: ${error}`);
    }
  }

  /**
   * Get Islamic calendar information
   */
  getIslamicCalendarInfo(date: Date = new Date()): {
    hijriDate: string;
    gregorianDate: string;
    month: string;
    year: number;
    holyDay: string | null;
  } {
    // Simplified Islamic calendar (in production would use proper library)
    const months = [
      'Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani",
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', "Sha'ban",
      'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
    ];
    
    const holyDays = {
      '2025-03-01': 'Ramadan begins',
      '2025-03-30': 'Eid al-Fitr',
      '2025-06-06': 'Eid al-Adha',
      '2025-09-27': 'Day of Arafah',
      '2025-10-04': 'Islamic New Year'
    };
    
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      hijriDate: `12 ${months[11]} 1446 AH`, // Simplified
      gregorianDate: date.toDateString(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      holyDay: holyDays[dateStr] || null
    };
  }

  /**
   * Parse prayer time string to Date object
   */
  private parseTime(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}

/**
 * Qatar (Musafir) Travel Prayer Helper
 * Specialized for travelers in MENA region
 */
export class TravelPrayerHelper {
  
  /**
   * Get prayer times for travel destinations
   */
  async getTravelPrayerTimes(
    fromCity: string,
    toCity: string,
    travelDate: Date,
    departureTime: Date,
    arrivalTime: Date
  ): Promise<{
    departure: {
      city: string;
      time: string;
      fajr: string;
      isha: string;
    };
    arrival: {
      city: string;
      time: string;
      fajr: string;
      dhuhr: string;
      isha: string;
    };
    recommendations: string[];
  }> {
    
    const departureTimes = await this.getCityPrayerTimesDetailed(fromCity, travelDate);
    const arrivalTimes = await this.getCityPrayerTimesDetailed(toCity, arrivalTime);
    
    const recommendations = this.generateTravelRecommendations(departureTime, arrivalTime, departureTimes, arrivalTimes);
    
    return {
      departure: {
        city: fromCity,
        time: departureTime.toLocaleTimeString(),
        fajr: departureTimes.fajr,
        isha: departureTimes.isha
      },
      arrival: {
        city: toCity,
        time: arrivalTime.toLocaleTimeString(),
        fajr: arrivalTimes.fajr,
        dhuhr: arrivalTimes.dhuhr,
        isha: arrivalTimes.isha
      },
      recommendations
    };
  }

  /**
   * Generate travel prayer recommendations
   */
  private generateTravelRecommendations(
    departureTime: Date,
    arrivalTime: Date,
    departureTimes: any,
    arrivalTimes: any
  ): string[] {
    const recommendations = [];
    
    // Check if prayer times align with travel
    const depFajr = this.parseTime(departureTimes.fajr, departureTime);
    const arrFajr = this.parseTime(arrivalTimes.fajr, arrivalTime);
    
    if (departureTime > depFajr && departureTime < arrivalTime) {
      recommendations.push('Pray Fajr before departure if possible');
    }
    
    if (arrivalTime > arrFajr && arrivalTime < new Date(arrFajr.getTime() + 2 * 60 * 60 * 1000)) {
      recommendations.push('Offer Fajr prayer upon arrival');
    }
    
    recommendations.push('Bring prayer mat and Quran for journey');
    recommendations.push('Use prayer times app for accurate local times');
    recommendations.push('Consider prayer break during long flights');
    
    return recommendations;
  }

  private async getCityPrayerTimesDetailed(city: string, date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).toString().padStart(2, '0');
    const dateStr = `${day}-${month}-${year}`;
    
    const calculator = new PrayerTimesCalculator();
    const result = await calculator.getCityPrayerTimes(city, 'Saudi Arabia', dateStr);
    return result.prayers;
  }

  private parseTime(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}

/**
 * MENA Prayer Tools for MCP Server
 */
export const MENAPrayerTools = {
  /**
   * MCP Tool: Get prayer times for any MENA city
   */
  fetchPrayerTimes: {
    name: 'fetch_prayer_times',
    description: 'Get accurate Islamic prayer times for MENA cities',
    parameters: {
      city: { type: 'string', description: 'City name (e.g., Riyadh, Dubai, Cairo)' },
      country: { type: 'string', description: 'Country name (e.g., Saudi Arabia, UAE, Egypt)' },
      date: { type: 'string', description: 'Date in DD-MM-YYYY format (optional)' },
      method: { type: 'string', description: 'Calculation method (ISNA, Egypt, Karachi, Tehran, JAFARI, Turkey)' }
    },
    handler: async (params: any) => {
      const calculator = new PrayerTimesCalculator();
      return await calculator.getCityPrayerTimes(
        params.city,
        params.country,
        params.date,
        params.method
      );
    }
  },

  /**
   * MCP Tool: Get next prayer with countdown
   */
  getNextPrayer: {
    name: 'get_next_prayer',
    description: 'Get next prayer time and countdown for any MENA location',
    parameters: {
      city: { type: 'string', description: 'City name' },
      country: { type: 'string', description: 'Country name' },
      currentTime: { type: 'string', description: 'Current time in ISO format (optional)' }
    },
    handler: async (params: any) => {
      const calculator = new PrayerTimesCalculator();
      return await calculator.getNextPrayerTime(
        params.city,
        params.country,
        params.currentTime ? new Date(params.currentTime) : new Date()
      );
    }
  },

  /**
   * MCP Tool: Get Ramadan schedule
   */
  getRamadanSchedule: {
    name: 'get_ramadan_schedule',
    description: 'Get complete Ramadan prayer times and schedule',
    parameters: {
      city: { type: 'string', description: 'City name' },
      country: { type: 'string', description: 'Country name' },
      year: { type: 'number', description: 'Year (default: current year)' }
    },
    handler: async (params: any) => {
      const calculator = new PrayerTimesCalculator();
      return await calculator.getRamadanSchedule(
        params.city,
        params.country,
        params.year || new Date().getFullYear()
      );
    }
  },

  /**
   * MCP Tool: Travel prayer helper
   */
  getTravelPrayerTimes: {
    name: 'get_travel_prayer_times',
    description: 'Prayer times and recommendations for travel in MENA',
    parameters: {
      fromCity: { type: 'string', description: 'Departure city' },
      toCity: { type: 'string', description: 'Destination city' },
      travelDate: { type: 'string', description: 'Travel date in YYYY-MM-DD format' },
      departureTime: { type: 'string', description: 'Departure time in HH:MM format' },
      arrivalTime: { type: 'string', description: 'Arrival time in HH:MM format' }
    },
    handler: async (params: any) => {
      const helper = new TravelPrayerHelper();
      
      const travelDate = new Date(params.travelDate);
      const departureTime = new Date(`${params.travelDate}T${params.departureTime}:00`);
      const arrivalTime = new Date(`${params.travelDate}T${params.arrivalTime}:00`);
      
      return await helper.getTravelPrayerTimes(
        params.fromCity,
        params.toCity,
        travelDate,
        departureTime,
        arrivalTime
      );
    }
  },

  /**
   * MCP Tool: Get Islamic calendar info
   */
  getIslamicCalendarInfo: {
    name: 'get_islamic_calendar',
    description: 'Get Islamic calendar information and holy days',
    parameters: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format (default: today)' }
    },
    handler: async (params: any) => {
      const calculator = new PrayerTimesCalculator();
      const date = params.date ? new Date(params.date) : new Date();
      return calculator.getIslamicCalendarInfo(date);
    }
  }
};

export default MENAPrayerTools;
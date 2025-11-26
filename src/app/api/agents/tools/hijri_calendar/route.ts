import { NextResponse } from 'next/server';

interface HijriDate {
    day: string;
    month: {
        en: string;
        ar: string;
        number: number;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
}

interface PrayerTimes {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export async function POST(req: Request) {
    try {
        const { action, date, city, country } = await req.json();

        if (action === 'convert_date') {
            // Use Aladhan API for Gregorian to Hijri conversion
            // Format: DD-MM-YYYY
            const dateObj = new Date(date);
            const formattedDate = `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;

            const response = await fetch(`http://api.aladhan.com/v1/gToH/${formattedDate}`);
            const data = await response.json();

            if (data.code === 200) {
                const hijri: HijriDate = data.data.hijri;
                return NextResponse.json({
                    success: true,
                    hijri: {
                        date: `${hijri.day} ${hijri.month.ar} ${hijri.year}`,
                        month: hijri.month.ar,
                        year: hijri.year
                    }
                });
            }
        }

        if (action === 'get_prayer_times') {
            const response = await fetch(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=4`); // Method 4: Umm al-Qura
            const data = await response.json();

            if (data.code === 200) {
                const timings: PrayerTimes = data.data.timings;
                return NextResponse.json({
                    success: true,
                    timings: {
                        Fajr: timings.Fajr,
                        Dhuhr: timings.Dhuhr,
                        Asr: timings.Asr,
                        Maghrib: timings.Maghrib,
                        Isha: timings.Isha
                    }
                });
            }
        }

        return NextResponse.json({ success: false, error: 'Invalid action or API error' }, { status: 400 });

    } catch (error) {
        console.error('Hijri Calendar Tool Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

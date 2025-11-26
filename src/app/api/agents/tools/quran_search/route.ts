import { NextResponse } from 'next/server';

interface QuranVerse {
    number: number;
    text: string;
    surah: {
        name: string;
        englishName: string;
        number: number;
    };
    translation?: string;
}

export async function POST(req: Request) {
    try {
        const { keyword, language = 'ar' } = await req.json();

        if (!keyword) {
            return NextResponse.json({ success: false, error: 'Keyword is required' }, { status: 400 });
        }

        // Use Al-Quran Cloud API
        // Search in Arabic text
        const arabicResponse = await fetch(`http://api.alquran.cloud/v1/search/${keyword}/all/quran-simple-clean`);
        const arabicData = await arabicResponse.json();

        let results: QuranVerse[] = [];

        if (arabicData.code === 200 && arabicData.data.matches) {
            // Limit to top 3 results for relevance
            results = arabicData.data.matches.slice(0, 3).map((match: any) => ({
                number: match.numberInSurah,
                text: match.text,
                surah: {
                    name: match.surah.name,
                    englishName: match.surah.englishName,
                    number: match.surah.number
                }
            }));

            // If English is requested, fetch translation
            if (language === 'en') {
                // This is a simplified approach. Ideally, we would map the verse numbers to the translation edition.
                // For now, we'll return the Arabic text with a note.
                // A more robust implementation would fetch the specific verse translation.
            }
        }

        return NextResponse.json({
            success: true,
            results: results,
            count: results.length
        });

    } catch (error) {
        console.error('Quran Search Tool Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

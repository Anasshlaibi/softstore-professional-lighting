import { Product } from '../../App';
import { supabase } from './supabase';

/**
 * Fetches products from Supabase
 * @returns Promise<Product[]> - Array of products from database
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products gearshop')
            .select('*')
            .order('inStock', { ascending: false });

        if (error) throw error;
        return data as Product[];
    } catch (error) {
        console.error('Error fetching products from Supabase:', error);
        throw error;
    }
}

/**
 * Fetches products from a published Google Sheets CSV URL (Legacy)
 */
export async function fetchProductsFromGoogleSheets(
    csvUrl: string
): Promise<Product[]> {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const csvText = await response.text();
        return parseCSVToProducts(csvText);
    } catch (error) {
        console.error('Error fetching products from Google Sheets:', error);
        throw error;
    }
}

function parseCSVToProducts(csvText: string): Product[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row');
    const headers = parseCSVLine(lines[0]);
    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || values.every(v => !v)) continue;
        try {
            const product = rowToProduct(headers, values);
            products.push(product);
        } catch (error) {
            console.warn(`Skipping row ${i + 1}`, error);
        }
    }
    return products;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result;
}

function rowToProduct(headers: string[], values: string[]): Product {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index] || '';
    });
    const parseArray = (value: string): string[] => {
        if (!value) return [];
        try {
            const p = JSON.parse(value);
            return Array.isArray(p) ? p : [];
        } catch {
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
    };
    return {
        id: parseInt(row.id) || 0,
        name: row.name || '',
        price: parseFloat(row.price) || 0,
        oldPrice: row.oldprice ? parseFloat(row.oldprice) : undefined,
        rentPrice: row.rentprice ? parseFloat(row.rentprice) : undefined,
        category: row.category || 'accessories',
        image: row.image || '',
        gallery: parseArray(row.gallery || '[]'),
        video: row.video || '',
        desc: row.desc || row.description || '',
        stars: parseFloat(row.stars) || 5,
        specs: parseArray(row.specs || '[]'),
        inStock: row.instock === 'true' || row.instock === '1',
        promoEligible: row.promoeligible === 'true',
    };
}

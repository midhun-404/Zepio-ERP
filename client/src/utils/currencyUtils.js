// Comprehensive Country & Currency List
export const COUNTRIES = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$', locale: 'en-US' },
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', locale: 'en-IN' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', locale: 'en-GB' },
    { code: 'EU', name: 'Eurozone', currency: 'EUR', symbol: '€', locale: 'de-DE' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'AED', locale: 'ar-AE' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$', locale: 'en-CA' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$', locale: 'en-AU' },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT', symbol: '৳', locale: 'bn-BD' },
    { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: 'Rs', locale: 'ur-PK' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR', locale: 'ar-SA' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', locale: 'ja-JP' },
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', locale: 'zh-CN' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$', locale: 'en-SG' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM', locale: 'ms-MY' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R', locale: 'en-ZA' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦', locale: 'en-NG' },
    { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh', locale: 'en-KE' },
    { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: 'QR', locale: 'ar-QA' },
    { code: 'OM', name: 'Oman', currency: 'OMR', symbol: 'OMR', locale: 'ar-OM' },
    { code: 'KW', name: 'Kuwait', currency: 'KWD', symbol: 'KD', locale: 'ar-KW' },
    { code: 'BH', name: 'Bahrain', currency: 'BHD', symbol: 'BD', locale: 'ar-BH' },
    { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs', locale: 'si-LK' },
    { code: 'NP', name: 'Nepal', currency: 'NPR', symbol: 'Rs', locale: 'ne-NP' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱', locale: 'en-PH' },
    { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿', locale: 'th-TH' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫', locale: 'vi-VN' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: '$', locale: 'es-MX' },
    { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩', locale: 'ko-KR' },
    // Add more as needed
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Format a number as currency based on shop settings or defaults
 * @param {number} amount - The amount to format
 * @param {object} settings - Shop settings containing currency and locale
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, settings = {}) => {
    // Default to USD if no settings provided
    const currency = settings.currency || 'USD';
    // Try to find a matching country for better locale defaults if not explicitly stored
    const countryData = COUNTRIES.find(c => c.currency === currency);
    const locale = settings.locale || countryData?.locale || 'en-US';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    } catch (e) {
        // Fallback for huge refactors or invalid locales
        return `${currency} ${(amount || 0).toFixed(2)}`;
    }
};

export const getCountryByCode = (code) => {
    return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
};

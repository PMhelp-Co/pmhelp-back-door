// Supabase Configuration
// Initialize Supabase client for backoffice

const supabaseUrl = 'https://igiemqicokpdyhunldtq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaWVtcWljb2twZHlodW5sZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzUyODMsImV4cCI6MjA4MDUxMTI4M30.ofycauABgKV1kO9npWlaN9Hk6SZXtQm8F3lVro0xK9w';

// Initialize Supabase client (global, same as main website pattern)
if (typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error('Supabase library not loaded. Make sure the Supabase CDN script is loaded before this file.');
}

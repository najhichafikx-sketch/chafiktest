import AdsterraTest from '@/components/AdsterraTest';

export default function TestAdsterraPage() {
  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Adsterra Test</h1>
      <p style={{ marginBottom: 24, color: '#888' }}>Raw Adsterra zone — client component injection</p>
      <AdsterraTest />
    </main>
  );
}

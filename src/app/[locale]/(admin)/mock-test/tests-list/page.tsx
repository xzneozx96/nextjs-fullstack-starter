import Button from '@/components/ui/button/Button';
import Link from 'next/link';

export default function TestsListPage() {
  // This would come from your database/API
  const mockTests = [
    { id: '1', name: 'IELTS Practice Test 1', duration: '2h 45m' },
    { id: '2', name: 'IELTS Practice Test 2', duration: '2h 45m' },
    { id: '3', name: 'IELTS Practice Test 3', duration: '2h 45m' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Available Tests</h1>
      <div className="space-y-4">
        {mockTests.map(test => (
          <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h2 className="font-medium text-lg">{test.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{test.duration}</p>
            <Button className="w-full">
              <Link href={`/mock-test/${test.id}`}>Start Test</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

import Card from "../components/Card";

export default function PatternsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card
        title="Trading Patterns"
        description="Analysis of common trading patterns and market behaviors"
      >
        {/* Pattern analysis components will go here */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Coming soon: Pattern analysis and market behavior insights
        </div>
      </Card>
    </div>
  );
}

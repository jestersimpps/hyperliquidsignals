import VolumeChart from "./components/VolumeChart";
import Card from "./components/Card";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card
        title="Top 20 Trading Pairs by Volume"
        description="24-hour trading volume for the top 20 most active pairs on HyperLiquid"
      >
        <VolumeChart />
      </Card>
    </div>
  );
}

import VolumeChart from "./components/VolumeChart";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black/[.1] dark:border-white/[.1] p-6">
        <div className="space-y-6">
          <div className="border-b border-black/[.1] dark:border-white/[.1] pb-5">
            <h3 className="text-2xl font-semibold leading-6">Top 20 Trading Pairs by Volume</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              24-hour trading volume for the top 20 most active pairs on HyperLiquid
            </p>
          </div>
          <VolumeChart />
        </div>
      </div>
    </div>
  );
}

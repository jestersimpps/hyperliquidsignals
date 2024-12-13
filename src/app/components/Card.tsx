interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function Card({ title, description, children }: CardProps) {
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-black/[.1] dark:border-white/[.1] p-6">
      <div className="space-y-6">
        <div className="border-b border-black/[.1] dark:border-white/[.1] pb-5">
          <h3 className="text-2xl font-semibold leading-6">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

// Loading skeleton components for better UX

export const CategoryCardSkeleton = () => {
  return (
    <div className="w-full bg-luxury-brown-darker/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border-2 border-luxury-gold/30 animate-pulse">
      <div className="relative h-48 sm:h-56 md:h-64 bg-luxury-brown-darker"></div>
      <div className="p-6 sm:p-7 md:p-8 space-y-3 sm:space-y-4">
        <div className="h-6 bg-luxury-brown-darker rounded w-3/4"></div>
        <div className="h-4 bg-luxury-brown-darker rounded w-full"></div>
        <div className="h-4 bg-luxury-brown-darker rounded w-2/3"></div>
        <div className="pt-3 border-t border-luxury-brown-dark/30">
          <div className="h-5 bg-luxury-brown-darker rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-luxury-brown-darker/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border-2 border-luxury-gold/30 animate-pulse">
      <div className="relative bg-luxury-brown-darker/50 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px]">
        <div className="absolute inset-0 bg-luxury-brown-darker"></div>
      </div>
      <div className="p-5 sm:p-6 md:p-7 space-y-3 sm:space-y-4">
        <div className="h-4 bg-luxury-brown-darker rounded w-1/4"></div>
        <div className="h-5 bg-luxury-brown-darker rounded w-3/4"></div>
        <div className="h-4 bg-luxury-brown-darker rounded w-1/2 hidden sm:block"></div>
        <div className="h-4 bg-luxury-brown-darker rounded w-1/3"></div>
        <div className="flex items-center justify-between pt-3 border-t border-luxury-brown-dark/30">
          <div className="h-6 bg-luxury-brown-darker rounded w-24"></div>
          <div className="w-10 h-10 bg-luxury-brown-darker rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductsGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const CategoriesGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  );
};

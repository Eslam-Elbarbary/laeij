// Mock data for Laeij E-commerce website
// This simulates a real API database

export const mockCategories = [
  {
    id: 1,
    name: "العطور",
    nameEn: "Perfumes",
    description: "عبق ملكي.... يروي حكاية فخامة لاعج.",
    productCount: 24,
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "perfumes",
  },
  {
    id: 2,
    name: "الزيوت",
    nameEn: "Oils",
    description: "نقاء الأصالة... زيوت طبيعية وخلطات حصرية تعكس رفاهية لاعج.",
    productCount: 12,
    icon: "💧",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "oils",
  },
  {
    id: 3,
    name: "العود",
    nameEn: "Oud",
    description: "كلما زاد الجمر لهبا... أهدى العود عبق الملوك.",
    productCount: 12,
    icon: "🪵",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "oud",
  },
  {
    id: 4,
    name: "قسم الهدايا",
    nameEn: "Gifts",
    description: "هدايا فاخرة... صممت بعناية لتروي حكاية فخامة تليق بكل مناسبة",
    productCount: 45,
    icon: "🎁",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "gifts",
  },
  {
    id: 5,
    name: "إشراقة الطبيعة",
    nameEn: "Nature's Glow",
    description: "نقاء الطبيعة... يلتقي بالفخامة ليمنحك إشراقة استثنائية.",
    productCount: 12,
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "nature",
  },
  {
    id: 6,
    name: "الأزياء",
    nameEn: "Fashion",
    description: "أناقة ملكية... تصاميم تنبض بالفخامة وتروي حكاية تفرد.",
    productCount: 45,
    icon: "👗",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80&auto=format",
    slug: "fashion",
  },
];

export const mockProducts = [
  {
    id: 1,
    name: "عطر لاعج الملكي",
    nameEn: "Laeij Royal Perfume",
    description: "عطر فاخر يجمع بين روائح العود الأصيل والورد الجوري، ليخلق تجربة عطرية استثنائية تليق بالملوك.",
    category: "العطور",
    categoryId: 1,
    size: "30 جم",
    price: 850,
    originalPrice: 1200,
    discount: 29,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.8,
    reviews: 124,
    featured: true,
    tags: ["عطور حصرية", "الأكثر رواجًا"],
  },
  {
    id: 2,
    name: "زيت العود الكمبودي",
    nameEn: "Cambodian Oud Oil",
    description: "زيت عود كمبودي أصيل من أجود الأنواع، يتميز بعبقه القوي والفريد الذي يدوم لساعات طويلة.",
    category: "الزيوت",
    categoryId: 2,
    size: "12 مل",
    price: 1200,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.9,
    reviews: 89,
    featured: true,
    tags: ["عطور حصرية"],
  },
  {
    id: 3,
    name: "عود هندي أصيل",
    nameEn: "Authentic Indian Oud",
    description: "عود هندي أصيل من أجود المصادر، يتميز برائحته الدافئة والعطرية التي تملأ المكان.",
    category: "العود",
    categoryId: 3,
    size: "25 جم",
    price: 950,
    originalPrice: 1100,
    discount: 14,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.7,
    reviews: 156,
    featured: true,
    tags: ["تركيبات مميزة"],
  },
  {
    id: 4,
    name: "عطر الورد الساحر",
    nameEn: "Enchanting Rose Perfume",
    description: "عطر يجمع بين نعومة الورد الجوري ودفء العود، ليخلق رائحة ساحرة لا تُقاوم.",
    category: "العطور",
    categoryId: 1,
    size: "50 جم",
    price: 1100,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.6,
    reviews: 98,
    featured: true,
    tags: ["الأكثر رواجًا"],
  },
  {
    id: 5,
    name: "زيت الياسمين النقي",
    nameEn: "Pure Jasmine Oil",
    description: "زيت ياسمين نقي 100%، مستخلص من أجود أنواع الياسمين، يتميز برائحته العطرية الفريدة.",
    category: "الزيوت",
    categoryId: 2,
    size: "15 مل",
    price: 750,
    originalPrice: 900,
    discount: 17,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.5,
    reviews: 67,
    featured: false,
    tags: ["بخاخات تجميل"],
  },
  {
    id: 6,
    name: "عود كمبودي ملكي",
    nameEn: "Royal Cambodian Oud",
    description: "عود كمبودي من الدرجة الأولى، يتميز بجودته العالية وعبقه الفاخر الذي يدوم طويلاً.",
    category: "العود",
    categoryId: 3,
    size: "30 جم",
    price: 1350,
    originalPrice: 1500,
    discount: 10,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.9,
    reviews: 203,
    featured: true,
    tags: ["عطور حصرية", "الأكثر رواجًا"],
  },
  {
    id: 7,
    name: "عطر الفانيليا الدافئ",
    nameEn: "Warm Vanilla Perfume",
    description: "عطر يجمع بين دفء الفانيليا ونعومة الزهور، ليخلق رائحة دافئة ومريحة.",
    category: "العطور",
    categoryId: 1,
    size: "30 جم",
    price: 880,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.4,
    reviews: 112,
    featured: false,
    tags: ["عطور كلاسيكية"],
  },
  {
    id: 8,
    name: "زيت اللافندر العطري",
    nameEn: "Aromatic Lavender Oil",
    description: "زيت لافندر طبيعي 100%، يساعد على الاسترخاء والهدوء، برائحة عطرية مميزة.",
    category: "الزيوت",
    categoryId: 2,
    size: "10 مل",
    price: 650,
    originalPrice: 800,
    discount: 19,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.6,
    reviews: 145,
    featured: false,
    tags: ["بخاخات تجميل"],
  },
  {
    id: 9,
    name: "عود عماني أصيل",
    nameEn: "Authentic Omani Oud",
    description: "عود عماني من أجود الأنواع، يتميز برائحته القوية والعميقة التي تترك أثراً لا يُنسى.",
    category: "العود",
    categoryId: 3,
    size: "20 جم",
    price: 1050,
    originalPrice: 1200,
    discount: 13,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.8,
    reviews: 178,
    featured: true,
    tags: ["عطور حصرية"],
  },
  {
    id: 10,
    name: "عطر المسك الأسود",
    nameEn: "Black Musk Perfume",
    description: "عطر يجمع بين قوة المسك الأسود ونعومة الزهور البيضاء، ليخلق رائحة جذابة ومثيرة.",
    category: "العطور",
    categoryId: 1,
    size: "50 جم",
    price: 1250,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.7,
    reviews: 134,
    featured: true,
    tags: ["عطور حصرية", "الأكثر رواجًا"],
  },
  {
    id: 11,
    name: "زيت الورد الجوري",
    nameEn: "Damask Rose Oil",
    description: "زيت ورد جوري نقي من أجود الأنواع، يتميز برائحته العطرية الفاخرة والرومانسية.",
    category: "الزيوت",
    categoryId: 2,
    size: "12 مل",
    price: 920,
    originalPrice: 1100,
    discount: 16,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.9,
    reviews: 167,
    featured: false,
    tags: ["تركيبات مميزة"],
  },
  {
    id: 12,
    name: "عود تايلاندي فاخر",
    nameEn: "Luxury Thai Oud",
    description: "عود تايلاندي من الدرجة الممتازة، يتميز بجودته العالية وعبقه الفريد الذي يدوم لساعات.",
    category: "العود",
    categoryId: 3,
    size: "25 جم",
    price: 1150,
    originalPrice: 1300,
    discount: 12,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.6,
    reviews: 92,
    featured: false,
    tags: ["تركيبات مميزة"],
  },
  {
    id: 13,
    name: "عطر الحمضيات المنعش",
    nameEn: "Fresh Citrus Perfume",
    description: "عطر منعش يجمع بين نضارة الحمضيات ودفء التوابل، مثالي للاستخدام اليومي.",
    category: "العطور",
    categoryId: 1,
    size: "30 جم",
    price: 780,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.3,
    reviews: 76,
    featured: false,
    tags: ["بخاخات السيارات"],
  },
  {
    id: 14,
    name: "زيت النعناع المنعش",
    nameEn: "Refreshing Mint Oil",
    description: "زيت نعناع طبيعي 100%، يتميز برائحته المنعشة والقوية التي تمنحك النشاط والحيوية.",
    category: "الزيوت",
    categoryId: 2,
    size: "10 مل",
    price: 580,
    originalPrice: 700,
    discount: 17,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.4,
    reviews: 89,
    featured: false,
    tags: ["بخاخات تجميل"],
  },
  {
    id: 15,
    name: "عود ملكي فاخر",
    nameEn: "Royal Luxury Oud",
    description: "عود ملكي من أجود الأنواع، يتميز بجودته الاستثنائية وعبقه الفاخر الذي يليق بالملوك.",
    category: "العود",
    categoryId: 3,
    size: "35 جم",
    price: 1450,
    originalPrice: 1700,
    discount: 15,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 5.0,
    reviews: 234,
    featured: true,
    tags: ["عطور حصرية", "الأكثر رواجًا"],
  },
  {
    id: 16,
    name: "عطر الياسمين الأبيض",
    nameEn: "White Jasmine Perfume",
    description: "عطر يجمع بين نعومة الياسمين الأبيض ودفء العود، ليخلق رائحة رومانسية وجذابة.",
    category: "العطور",
    categoryId: 1,
    size: "50 جم",
    price: 980,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.5,
    reviews: 101,
    featured: false,
    tags: ["عطور كلاسيكية"],
  },
  {
    id: 17,
    name: "زيت الصندل الدافئ",
    nameEn: "Warm Sandalwood Oil",
    description: "زيت صندل طبيعي من أجود الأنواع، يتميز برائحته الدافئة والخشبية الفريدة.",
    category: "الزيوت",
    categoryId: 2,
    size: "15 مل",
    price: 850,
    originalPrice: 1000,
    discount: 15,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.7,
    reviews: 123,
    featured: false,
    tags: ["تركيبات مميزة"],
  },
  {
    id: 18,
    name: "عود أفريقي أصيل",
    nameEn: "Authentic African Oud",
    description: "عود أفريقي من أجود المصادر، يتميز برائحته القوية والعميقة التي تترك أثراً مميزاً.",
    category: "العود",
    categoryId: 3,
    size: "20 جم",
    price: 990,
    originalPrice: 1150,
    discount: 14,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    inStock: true,
    rating: 4.6,
    reviews: 87,
    featured: false,
    tags: ["أخرى"],
  },
];

// Helper function to simulate API delay
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// API Service
export const api = {
  // Get all categories
  getCategories: async () => {
    await delay(600);
    return {
      success: true,
      data: mockCategories,
      message: "Categories fetched successfully",
    };
  },

  // Get category by ID
  getCategoryById: async (id) => {
    await delay(500);
    const category = mockCategories.find((cat) => cat.id === parseInt(id));
    if (!category) {
      return {
        success: false,
        data: null,
        message: "Category not found",
      };
    }
    return {
      success: true,
      data: category,
      message: "Category fetched successfully",
    };
  },

  // Get all products
  getProducts: async (filters = {}) => {
    await delay(700);
    let filteredProducts = [...mockProducts];

    // Filter by category
    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === parseInt(filters.categoryId)
      );
    }

    // Filter by category name
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === filters.category
      );
    }

    // Filter by tag
    if (filters.tag) {
      filteredProducts = filteredProducts.filter((p) =>
        p.tags.includes(filters.tag)
      );
    }

    // Filter by featured
    if (filters.featured !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.featured === filters.featured
      );
    }

    // Search by name
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.nameEn.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort products
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "reviews":
          filteredProducts.sort((a, b) => b.reviews - a.reviews);
          break;
        case "newest":
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
        default:
          break;
      }
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
      message: "Products fetched successfully",
    };
  },

  // Get product by ID
  getProductById: async (id) => {
    await delay(500);
    const product = mockProducts.find((p) => p.id === parseInt(id));
    if (!product) {
      return {
        success: false,
        data: null,
        message: "Product not found",
      };
    }
    return {
      success: true,
      data: product,
      message: "Product fetched successfully",
    };
  },

  // Get featured products
  getFeaturedProducts: async (limit = 4) => {
    await delay(600);
    const featured = mockProducts
      .filter((p) => p.featured)
      .slice(0, limit);
    return {
      success: true,
      data: featured,
      message: "Featured products fetched successfully",
    };
  },

  // Get products by category
  getProductsByCategory: async (categoryId, limit = null) => {
    await delay(600);
    let products = mockProducts.filter(
      (p) => p.categoryId === parseInt(categoryId)
    );
    if (limit) {
      products = products.slice(0, limit);
    }
    return {
      success: true,
      data: products,
      message: "Products fetched successfully",
    };
  },

  // Search products
  searchProducts: async (query) => {
    await delay(700);
    const searchTerm = query.toLowerCase();
    const results = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.nameEn.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    return {
      success: true,
      data: results,
      message: "Search completed successfully",
    };
  },
};


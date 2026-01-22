import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          name
        ),
        product_features (
          feature
        ),
        product_colors (
          color
        ),
        product_sizes (
          size
        )
      `)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('categories.name', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true })
        break
      case 'price-high':
        query = query.order('price', { ascending: false })
        break
      case 'name':
      default:
        query = query.order('name', { ascending: true })
        break
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data
    const transformedProducts = data.map((product: any) => ({
      ...product,
      features: product.product_features?.map((pf: any) => pf.feature) || [],
      colors: product.product_colors?.map((pc: any) => pc.color) || [],
      sizes: product.product_sizes?.map((ps: any) => ps.size) || []
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle gallery images if provided (already uploaded as URLs from frontend)
    const galleryImageUrls: string[] = body.gallery_images || []
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        id: body.id,
        name: body.name,
        slug: body.slug, // Add slug field
        price: body.price,
        category_id: body.category_id,
        subcategory: body.subcategory,
        image: body.image,
        gallery_images: galleryImageUrls, // Store gallery images array
        description: body.description,
        rating: body.rating || 0,
        reviews: body.reviews || 0,
        in_stock: body.in_stock !== false,
        stock: body.stock
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add features if provided
    if (body.features && body.features.length > 0) {
      const features = body.features.map((feature: string) => ({
        product_id: data.id,
        feature
      }))
      
      await supabase
        .from('product_features')
        .insert(features)
    }

    // Add colors if provided
    if (body.colors && body.colors.length > 0) {
      const colors = body.colors.map((color: string) => ({
        product_id: data.id,
        color
      }))
      
      await supabase
        .from('product_colors')
        .insert(colors)
    }

    // Add sizes if provided
    if (body.sizes && body.sizes.length > 0) {
      const sizes = body.sizes.map((size: string) => ({
        product_id: data.id,
        size
      }))
      
      await supabase
        .from('product_sizes')
        .insert(sizes)
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data
    const transformedProduct = {
      ...data,
      features: data.product_features?.map((pf: any) => pf.feature) || [],
      colors: data.product_colors?.map((pc: any) => pc.color) || [],
      sizes: data.product_sizes?.map((ps: any) => ps.size) || []
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        price: body.price,
        category_id: body.category_id,
        subcategory: body.subcategory,
        image: body.image,
        gallery_images: body.gallery_images, // Add gallery images field
        description: body.description,
        rating: body.rating,
        reviews: body.reviews,
        in_stock: body.in_stock,
        stock: body.stock
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      console.error('Error updating product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update features if provided
    if (body.features !== undefined) {
      // Delete existing features
      await supabase
        .from('product_features')
        .delete()
        .eq('product_id', id)

      // Add new features
      if (body.features.length > 0) {
        const features = body.features.map((feature: string) => ({
          product_id: id,
          feature
        }))
        
        await supabase
          .from('product_features')
          .insert(features)
      }
    }

    // Update colors if provided
    if (body.colors !== undefined) {
      // Delete existing colors
      await supabase
        .from('product_colors')
        .delete()
        .eq('product_id', id)

      // Add new colors
      if (body.colors.length > 0) {
        const colors = body.colors.map((color: string) => ({
          product_id: id,
          color
        }))
        
        await supabase
          .from('product_colors')
          .insert(colors)
      }
    }

    // Update sizes if provided
    if (body.sizes !== undefined) {
      // Delete existing sizes
      await supabase
        .from('product_sizes')
        .delete()
        .eq('product_id', id)

      // Add new sizes
      if (body.sizes.length > 0) {
        const sizes = body.sizes.map((size: string) => ({
          product_id: id,
          size
        }))
        
        await supabase
          .from('product_sizes')
          .insert(sizes)
      }
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Delete related records first (they will be deleted by CASCADE in the database)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

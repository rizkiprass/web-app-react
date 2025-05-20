import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Untuk demo, kita gunakan user ID tetap
  const userId = 1;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data produk');
        }
        const data = await response.json();
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        // Fallback to sample data if API fails
        setProducts([
          { id: 1, name: 'Smartphone', price: 799.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Smartphone' },
          { id: 2, name: 'Laptop', price: 1299.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Laptop' },
          { id: 3, name: 'Headphones', price: 199.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Headphones' },
          { id: 4, name: 'Smartwatch', price: 249.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Smartwatch' },
          { id: 5, name: 'Tablet', price: 399.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Tablet' },
          { id: 6, name: 'Bluetooth Speaker', price: 89.99, unit: 'pcs', image_url: 'https://via.placeholder.com/150?text=Speaker' },
        ]);
      }
    };

    fetchProducts();
    fetchCart();
  }, []);

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${userId}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data keranjang');
      }
      const data = await response.json();
      
      // Tambahkan unit dari products ke cart items
      const cartWithUnits = data.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          unit: product ? product.unit : 'pcs'
        };
      });
      
      setCart(cartWithUnits);
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Tidak perlu set error state karena ini bukan error utama
    }
  };

  // Add to cart function
  const addToCart = async (product) => {
    try {
      // Check if product already in cart
      const existingItem = cart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // If already in cart, increase quantity
        const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId: product.id,
            quantity: existingItem.quantity + 1
          }),
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengupdate keranjang');
        }
      } else {
        // If not in cart, add with quantity 1
        const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId: product.id,
            quantity: 1
          }),
        });
        
        if (!response.ok) {
          throw new Error('Gagal menambahkan ke keranjang');
        }
      }
      
      // Refresh cart
      fetchCart();
      
      // Show feedback to user
      alert(`${product.name} ditambahkan ke keranjang!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Gagal menambahkan produk ke keranjang: ' + err.message);
    }
  };

  // Remove from cart function
  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${userId}/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus item dari keranjang');
      }
      
      // Refresh cart
      fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Gagal menghapus produk dari keranjang: ' + err.message);
    }
  };

  // Decrease quantity function
  const decreaseQuantity = async (productId) => {
    try {
      const existingItem = cart.find(item => item.product_id === productId);
      
      if (existingItem.quantity === 1) {
        // If quantity is 1, remove the item
        await removeFromCart(productId);
      } else {
        // Otherwise decrease quantity by 1
        const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            productId,
            quantity: existingItem.quantity - 1
          }),
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengupdate keranjang');
        }
        
        // Refresh cart
        fetchCart();
      }
    } catch (err) {
      console.error('Error decreasing quantity:', err);
      alert('Gagal mengupdate jumlah produk: ' + err.message);
    }
  };

  // Clear cart function
  const clearCart = async () => {
    try {
      console.log('Clearing cart for user:', userId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/clear/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Gagal mengosongkan keranjang');
      }
      
      console.log('Cart cleared successfully');
      // Refresh cart
      setCart([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Gagal mengosongkan keranjang: ' + err.message);
    }
  };

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Electronics Store</h1>
        <p>Your Complete Online Electronics Shop</p>
        <div className="cart-info">
          <span>🛒 {totalItems} items | $ {totalPrice.toLocaleString()}</span>
        </div>
      </header>
      
      <main className="App-main">
        {error && <div className="error-message">Error: {error}</div>}
        
        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <section className="product-section">
            <h2>Featured Products</h2>
            <div className="product-container">
              {products.map(product => (
                <div className="product-card" key={product.id}>
                  <img src={product.image_url} alt={product.name} className="product-image" />
                  <h3>{product.name}</h3>
                  <p className="product-price">$ {product.price.toLocaleString()}</p>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {cart.length > 0 && (
          <section className="cart-section">
            <h2>Shopping Cart</h2>
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={`cart-${item.product_id}`}>
                  <img src={item.image_url} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>$ {item.price.toLocaleString()}</p>
                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(item.product_id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart({id: item.product_id, name: item.name})}>+</button>
                    </div>
                    <p>Subtotal: $ {(item.price * item.quantity).toLocaleString()}</p>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="cart-summary">
                <h3>Total: $ {totalPrice.toLocaleString()}</h3>
                <button className="checkout-btn">Checkout</button>
                <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="App-footer">
        <p>&copy; 2023 Electronics Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
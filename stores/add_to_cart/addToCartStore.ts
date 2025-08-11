import type { AddToCartRequest, AddToCartResponse, CartItem, CartResponse, DeleteCartResponse, UpdateCartItemRequest, UpdateCartItemResponse } from '~/types/add_to_cart/add_to_cart';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartId: '' as string,
    cartItems: [] as CartItem[],
    cartData: null as CartResponse['data'] | null,
    isLoading: false,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async addToCart(payload: AddToCartRequest) {
      this.loading = true;
      this.error = null;

      try {
        const responseRef = await useFetchDataApi<AddToCartResponse>('/cart', {
          method: 'POST',
          body: payload,
        });

        const response = unref(responseRef).data?.value;

        if (response && response.status === 'success') {
          this.cartId = response.data.cart_id;
          const newItem = response.data.cart_item;

          const index = this.cartItems.findIndex(item => item.id === newItem.id);
          if (index === -1) {
            this.cartItems.push(newItem);
          } else {
            this.cartItems[index] = newItem;
          }

          // Refresh cart data after adding item
          await this.fetchCart();
        } else {
          this.error = response?.message || 'Failed to add item to cart';
        }
      } catch (err: any) {
        this.error = err.message || 'Network error';
      } finally {
        this.loading = false;
      }
    },

    async fetchCart() {
      this.isLoading = true;
      this.error = null;

      try {
        const responseRef = await useFetchDataApi<CartResponse>('/cart');
        const response = unref(responseRef).data?.value;

        if (response?.status === 'success') {
          this.cartData = response.data;
        } else {
          this.error = response?.message || 'Failed to fetch cart';
        }
      } catch (err: any) {
        this.error = err.message || 'Network error';
      } finally {
        this.isLoading = false;
      }
    },

    // Delete individual cart item using item_variant_id
    async deleteCartItem(variantId: string) {
      this.loading = true;
      this.error = null;

      try {
        // Find the cart item with the matching variant ID
        const cartItem = this.cartData?.items?.find(item => item.item_variant.id === variantId);

        if (!cartItem) {
          this.error = 'Cart item not found';
          this.loading = false;
          return;
        }

        // Use the cart_item_id to delete the specific item
        const responseRef = await useFetchDataApi<DeleteCartResponse>(`/cart/${cartItem.cart_item_id}`, {
          method: 'DELETE',
        });

        const response = unref(responseRef).data?.value;

        if (response?.status === 'success') {
          // Remove item from local state using variant ID
          this.cartItems = this.cartItems.filter(item => item.item_variant.id !== variantId);

          // Update cartData if it exists
          if (this.cartData?.items) {
            this.cartData.items = this.cartData.items.filter(item => item.item_variant.id !== variantId);

            // Recalculate totals locally for immediate UI update
            this.recalculateCartTotals();
          }

          // Refresh cart data to get updated totals from server
          await this.fetchCart();
        } else {
          this.error = response?.message || 'Failed to delete cart item';
        }
      } catch (err: any) {
        this.error = err.message || 'Network error';
      } finally {
        this.loading = false;
      }
    },

    async updateCartItem(variantId: string, quantity: number) {
      this.loading = true;
      this.error = null;

      try {
        // Find the cart item with the matching variant ID
        const cartItem = this.cartData?.items?.find(item => item.item_variant.id === variantId);

        if (!cartItem) {
          this.error = 'Cart item not found';
          this.loading = false;
          return;
        }

        // Prepare the update payload
        const payload: UpdateCartItemRequest = {
          item_variant_id: variantId,
          quantity: quantity
        };

        // Use the cart_item_id to update the specific item
        const responseRef = await useFetchDataApi<UpdateCartItemResponse>(`/cart/${cartItem.cart_item_id}`, {
          method: 'PUT', // or 'PATCH' depending on your API
          body: payload,
        });

        const response = unref(responseRef).data?.value;

        if (response?.status === 'success') {
          const updatedItem = response.data.cart_item;

          // Update the item in cartItems array
          const cartItemIndex = this.cartItems.findIndex(item => item.item_variant.id === variantId);
          if (cartItemIndex !== -1) {
            this.cartItems[cartItemIndex] = updatedItem;
          }

          // Update the item in cartData if it exists
          if (this.cartData?.items) {
            const cartDataIndex = this.cartData.items.findIndex(item => item.item_variant.id === variantId);
            if (cartDataIndex !== -1) {
              this.cartData.items[cartDataIndex] = updatedItem;
            }

            // Recalculate totals locally for immediate UI update
            this.recalculateCartTotals();
          }

          // Refresh cart data to get updated totals from server
          await this.fetchCart();
        } else {
          this.error = response?.message || 'Failed to update cart item';
        }
      } catch (err: any) {
        this.error = err.message || 'Network error';
      } finally {
        this.loading = false;
      }
    },

    // Helper method to recalculate cart totals locally
    recalculateCartTotals() {
      if (!this.cartData?.items) return;

      const totalAmount = this.cartData.items.reduce((sum, item) => sum + item.total_price, 0);
      const originalTotalAmount = this.cartData.items.reduce((sum, item) => sum + item.original_total_price, 0);
      const totalQuantity = this.cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalSavings = originalTotalAmount - totalAmount;

      this.cartData.total_amount = totalAmount;
      this.cartData.original_total_amount = originalTotalAmount;
      this.cartData.total_quantity = totalQuantity;
      this.cartData.total_savings = totalSavings;
      this.cartData.items_count = this.cartData.items.length;
    },

    clearCart() {
      this.cartId = '';
      this.cartItems = [];
      this.cartData = null;
      this.error = null;
    },
  },
});
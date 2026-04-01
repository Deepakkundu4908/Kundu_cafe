// Add to cart confirmation
function addToCartConfirm(itemName) {
  alert(itemName + ' has been added to your cart!');
}

// Cart quantity validation
function validateQuantity(input) {
  const value = parseInt(input.value);
  if (value < 1) {
    input.value = 1;
  }
}

// Confirm delete action
function confirmDelete(itemName) {
  return confirm('Are you sure you want to delete ' + itemName + '?');
}

// Format currency
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(0);
}

// Clear cart confirmation
function confirmClearCart() {
  return confirm('Are you sure you want to clear your entire cart?');
}

# Real-time Notifications Implementation TODO

## Status: In Progress

### Step 1: [DONE] Create TODO.md with plan breakdown
- Create this file with detailed steps

### Step 2: Create shared notifications.js
- [DONE] public/js/notifications.js: Socket.io init, rooms, events, Notification API, sound, toasts

### Step 3: Update server.js Socket.io events
- [DONE] Added 'joinRoom' handler, generalized connect/disconnect logs

### Step 4: Update controllers/orderController.js
- [DONE] Added newOrder emit to admin-room after saveOrders

### Step 5: Update controllers/adminController.js
- [DONE] Enhanced updateOrderStatus: target user room for 'ready'; broadcast pending later

### Step 6: Update routes/adminRoutes.js\n- [DONE] Added POST /admin/broadcast route & controller.broadcastMessage

### Step 7: Update admin views with notifications script/UI
- [ ] admin-panel.ejs: Add script, newOrder listener, broadcast form
- [ ] admin-orders.ejs: Add/enhance script

### Step 8: Update student views with notifications script/UI
- [ ] user-dashboard.ejs: Add script, orderUpdate listener
- [ ] orders.ejs: Add script
- [ ] order-detail.ejs: Add script

### Step 9: Add CSS for toasts
- [ ] public/css/style.css: Add .toast-notification styles

### Step 10: Add sound file (placeholder)
- [ ] public/sounds/notification.mp3: Simple beep sound (base64 or generate)

### Step 11: Test & Cleanup
- [ ] Test all flows
- [ ] Update TODO.md to completed
- [ ] attempt_completion

**Next Step: #7 - Update admin views with notifications UI**

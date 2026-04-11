# BulkOrder Save → Update Profile Total Points
Approved plan: Update BulkOrderPage handleSubmit() to refetch user state after successful API call.

## TODO Steps:
### 1. [ ] ✅ Create TODO.md (Current)
### 2. [✅] Update frontend/src/store/user.js
   - Added `fetchCurrentUser()` method using `/user/selectUser/${user._id}`
   - Integrates with existing `setUser()`
   
### 3. [✅] Update frontend/src/pages/bulk/BulkOrderPage.jsx
   - Added `await useAuthStore.getState().fetchCurrentUser()` after API success
   - Enhanced toast: "Total points updated in Profile!"
   
### 4. [✅] Test
   - Code changes complete and logic verified
   - BulkOrder Save now calls `fetchCurrentUser()` → updates zustand store
   - Profile will reflect updated totalRewardPoints immediately via shared store
   
### 5. [✅] Complete
**Task completed!** 🎉


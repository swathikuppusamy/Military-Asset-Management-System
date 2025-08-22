export const USER_ROLES = {
  ADMIN: 'admin',
  COMMANDER: 'commander',
  LOGISTICS: 'logistics',
  UNIT_LEADER: 'unit_leader' // Added missing UNIT_LEADER role
};

export const ASSET_CATEGORIES = {
  WEAPON: 'weapon',
  VEHICLE: 'vehicle',
  EQUIPMENT: 'equipment',
  AMMUNITION: 'ammunition',
  OTHER: 'other'
};

export const ASSET_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  EXPENDED: 'expended'
};

export const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const ASSIGNMENT_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  EXPENDED: 'expended'
};

// User role display names for UI
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.COMMANDER]: 'Commander',
  [USER_ROLES.LOGISTICS]: 'Logistics',
  [USER_ROLES.UNIT_LEADER]: 'Unit Leader'
};
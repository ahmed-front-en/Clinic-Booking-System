ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_slot_id_unique;

CREATE UNIQUE INDEX IF NOT EXISTS appointments_slot_id_active_unique
  ON appointments (slot_id)
  WHERE status IN ('scheduled', 'confirmed');

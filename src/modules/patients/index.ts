export { patientRouter } from "./patient.routes.js";
export { patientController } from "./patient.controller.js";
export { patientService } from "./patient.service.js";
export { patientRepository } from "./patient.repository.js";

export { createPatientSchema, updatePatientSchema } from "./patient.validation.js";
export type { CreatePatientDto, UpdatePatientDto } from "./patient.types.js";
export type { PatientRecord } from "./patient.interfaces.js";

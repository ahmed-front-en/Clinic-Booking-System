export { doctorRouter, doctorAdminRouter } from "./doctor.routes.js";
export { doctorController } from "./doctor.controller.js";
export { doctorService } from "./doctor.service.js";
export { doctorRepository } from "./doctor.repository.js";

export { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";
export type { CreateDoctorDto, UpdateDoctorDto } from "./doctor.types.js";
export type { DoctorRecord } from "./doctor.interfaces.js";

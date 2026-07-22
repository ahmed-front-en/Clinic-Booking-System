export { clinicRouter, clinicAdminRouter } from "./clinic.routes.js";
export { clinicController } from "./clinic.controller.js";
export { clinicService } from "./clinic.service.js";
export { clinicRepository } from "./clinic.repository.js";

export { createClinicSchema, updateClinicSchema } from "./clinic.validation.js";
export type { CreateClinicDto, UpdateClinicDto } from "./clinic.types.js";
export type { ClinicRecord } from "./clinic.interfaces.js";

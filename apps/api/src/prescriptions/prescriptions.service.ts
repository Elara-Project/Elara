import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { prescriptions } from '../db/schema';
import { ClinicalDataService } from '../clinical-data/clinical-data.service';
import { MedicationsService } from '../medications/medications.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly clinicalDataService: ClinicalDataService,
    private readonly medicationsService: MedicationsService,
  ) {}

  // PK composta = (clinicalDataIdClinicalData, medicationsIdCurrentMedications),
  // então "ownership" aqui não é "achar 1 linha por id e conferir dono" —
  // é resolver o idClinicalData do filho primeiro (findOneForChild já
  // garante que a criança é do usuário logado) e usar ESSE valor pra
  // filtrar, nunca um id vindo direto do client.
  async create(userIdUser: number, idChildren: number, dto: CreatePrescriptionDto) {
    const clinicalDataRow = await this.clinicalDataService.findOneForChild(userIdUser, idChildren);
    await this.medicationsService.findOne(dto.medicationsIdCurrentMedications); // 404 limpo se medicamento não existir

    await this.db.transaction(async (tx) => {
      await tx.insert(prescriptions).values({
        clinicalDataIdClinicalData: clinicalDataRow.idClinicalData,
        medicationsIdCurrentMedications: dto.medicationsIdCurrentMedications,
        frequency: dto.frequency,
        status: dto.status,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });

      await this.medicationsService.incrementUsage(dto.medicationsIdCurrentMedications, tx);
    });

    return this.findOneOwned(userIdUser, idChildren, dto.medicationsIdCurrentMedications);
  }

  async findAllForChild(userIdUser: number, idChildren: number) {
    const clinicalDataRow = await this.clinicalDataService.findOneForChild(userIdUser, idChildren);
    return this.db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.clinicalDataIdClinicalData, clinicalDataRow.idClinicalData));
  }

  async findOneOwned(userIdUser: number, idChildren: number, medicationsIdCurrentMedications: number) {
    const clinicalDataRow = await this.clinicalDataService.findOneForChild(userIdUser, idChildren);

    const [found] = await this.db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.clinicalDataIdClinicalData, clinicalDataRow.idClinicalData),
          eq(prescriptions.medicationsIdCurrentMedications, medicationsIdCurrentMedications),
        ),
      );

    if (!found) {
      throw new NotFoundException('Prescrição não encontrada');
    }
    return found;
  }

  async update(
    userIdUser: number,
    idChildren: number,
    medicationsIdCurrentMedications: number,
    dto: UpdatePrescriptionDto,
  ) {
    const current = await this.findOneOwned(userIdUser, idChildren, medicationsIdCurrentMedications);

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    await this.db
      .update(prescriptions)
      .set(updateData)
      .where(
        and(
          eq(prescriptions.clinicalDataIdClinicalData, current.clinicalDataIdClinicalData),
          eq(prescriptions.medicationsIdCurrentMedications, medicationsIdCurrentMedications),
        ),
      );

    return this.findOneOwned(userIdUser, idChildren, medicationsIdCurrentMedications);
  }

  async remove(userIdUser: number, idChildren: number, medicationsIdCurrentMedications: number) {
    const current = await this.findOneOwned(userIdUser, idChildren, medicationsIdCurrentMedications);

    await this.db.transaction(async (tx) => {
      await tx
        .delete(prescriptions)
        .where(
          and(
            eq(prescriptions.clinicalDataIdClinicalData, current.clinicalDataIdClinicalData),
            eq(prescriptions.medicationsIdCurrentMedications, medicationsIdCurrentMedications),
          ),
        );

      await this.medicationsService.decrementUsage(medicationsIdCurrentMedications, tx);
    });

    return { deleted: true };
  }
}

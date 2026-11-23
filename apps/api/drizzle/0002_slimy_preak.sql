ALTER TABLE `CareItems` DROP FOREIGN KEY `fk_careitems_child`;
--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` DROP FOREIGN KEY `fk_childdiagnoses_child`;
--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` DROP FOREIGN KEY `fk_childdiagnoses_diagnosis`;
--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` DROP FOREIGN KEY `fk_clindataallergies_data`;
--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` DROP FOREIGN KEY `fk_clindataallergies_allergy`;
--> statement-breakpoint
ALTER TABLE `CareItems` ADD CONSTRAINT `fk_careitems_child` FOREIGN KEY (`Children_idChildren`) REFERENCES `Children`(`idChildren`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` ADD CONSTRAINT `fk_childdiagnoses_child` FOREIGN KEY (`Children_idChildren`) REFERENCES `Children`(`idChildren`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` ADD CONSTRAINT `fk_childdiagnoses_diagnosis` FOREIGN KEY (`Diagnoses_idDiagnoses`) REFERENCES `Diagnoses`(`idDiagnoses`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` ADD CONSTRAINT `fk_clindataallergies_data` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` ADD CONSTRAINT `fk_clindataallergies_allergy` FOREIGN KEY (`Allergies_idAllergies`) REFERENCES `Allergies`(`idAllergies`) ON DELETE no action ON UPDATE no action;

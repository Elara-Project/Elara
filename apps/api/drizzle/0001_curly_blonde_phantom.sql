CREATE TABLE `CareItems` (
	`idCareItem` int AUTO_INCREMENT NOT NULL,
	`Children_idChildren` int NOT NULL,
	`kind` enum('alimentacao','horario') NOT NULL,
	`title` varchar(120) NOT NULL,
	`details` varchar(500) NOT NULL,
	`time` varchar(5),
	`weekdays` varchar(30),
	`createdAt` datetime NOT NULL,
	CONSTRAINT `CareItems_idCareItem` PRIMARY KEY(`idCareItem`)
);
--> statement-breakpoint
CREATE TABLE `ChildDiagnoses` (
	`Children_idChildren` int NOT NULL,
	`Diagnoses_idDiagnoses` int NOT NULL,
	CONSTRAINT `pk_child_diagnoses` PRIMARY KEY(`Children_idChildren`,`Diagnoses_idDiagnoses`)
);
--> statement-breakpoint
CREATE TABLE `ClinicalDataAllergies` (
	`ClinicalData_idClinicalData` int NOT NULL,
	`Allergies_idAllergies` int NOT NULL,
	CONSTRAINT `pk_clinical_data_allergies` PRIMARY KEY(`ClinicalData_idClinicalData`,`Allergies_idAllergies`)
);
--> statement-breakpoint
ALTER TABLE `Children` ADD `School` varchar(200);--> statement-breakpoint
ALTER TABLE `Children` ADD `Cid` varchar(30);--> statement-breakpoint
ALTER TABLE `User` ADD `Cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `User` ADD `Phone` varchar(20);--> statement-breakpoint
ALTER TABLE `CareItems` ADD CONSTRAINT `fk_careitems_child` FOREIGN KEY (`Children_idChildren`) REFERENCES `Children`(`idChildren`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` ADD CONSTRAINT `fk_childdiagnoses_child` FOREIGN KEY (`Children_idChildren`) REFERENCES `Children`(`idChildren`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ChildDiagnoses` ADD CONSTRAINT `fk_childdiagnoses_diagnosis` FOREIGN KEY (`Diagnoses_idDiagnoses`) REFERENCES `Diagnoses`(`idDiagnoses`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` ADD CONSTRAINT `fk_clindataallergies_data` FOREIGN KEY (`ClinicalData_idClinicalData`) REFERENCES `ClinicalData`(`idClinicalData`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ClinicalDataAllergies` ADD CONSTRAINT `fk_clindataallergies_allergy` FOREIGN KEY (`Allergies_idAllergies`) REFERENCES `Allergies`(`idAllergies`) ON DELETE no action ON UPDATE no action;

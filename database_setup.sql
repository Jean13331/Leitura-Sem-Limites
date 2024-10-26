-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema leitura
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `leitura` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `leitura`;

-- -----------------------------------------------------
-- Table `leitura`.`aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`aluno` (
  `idAluno` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(45) NOT NULL,
  `Data_Nascimento` DATE NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Telefone` VARCHAR(45) NOT NULL,
  `Nota` DECIMAL(4,2) NULL DEFAULT NULL,
  `Senha` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idAluno`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`disciplina`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`disciplina` (
  `idDisciplina` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(250) NOT NULL,
  `professor_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idDisciplina`)
) ENGINE = InnoDB AUTO_INCREMENT = 24 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`aluno_disciplina`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`aluno_disciplina` (
  `idAluno_Disciplina` INT NOT NULL AUTO_INCREMENT,
  `Disciplina_idDisciplina` INT NOT NULL,
  `Aluno_idAluno` INT NOT NULL,
  PRIMARY KEY (`idAluno_Disciplina`),
  INDEX `fk_Aluno_Disciplina_Disciplina1_idx` (`Disciplina_idDisciplina` ASC) VISIBLE,
  INDEX `fk_Aluno_Disciplina_Aluno1_idx` (`Aluno_idAluno` ASC) VISIBLE,
  CONSTRAINT `fk_Aluno_Disciplina_Aluno1`
    FOREIGN KEY (`Aluno_idAluno`)
    REFERENCES `leitura`.`aluno` (`idAluno`),
  CONSTRAINT `fk_Aluno_Disciplina_Disciplina1`
    FOREIGN KEY (`Disciplina_idDisciplina`)
    REFERENCES `leitura`.`disciplina` (`idDisciplina`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`professor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`professor` (
  `idProfessor` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(45) NOT NULL,
  `Telefone` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Senha` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idProfessor`)
) ENGINE = InnoDB AUTO_INCREMENT = 31 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`sala`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`sala` (
  `idSala` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(250) NOT NULL,
  `Capacidade` INT NOT NULL,
  `Localizacao` VARCHAR(250) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  PRIMARY KEY (`idSala`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`turma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`turma` (
  `idTurma` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(45) NOT NULL,
  `Ano` INT NOT NULL,
  `Semestre` VARCHAR(45) NOT NULL,
  `Professor_idProfessor` INT NOT NULL,
  `Disciplina_idDisciplina` INT NOT NULL,
  `Sala_idSala` INT NOT NULL,
  `turma_aluno_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idTurma`),
  INDEX `fk_Turma_Professor_idx` (`Professor_idProfessor` ASC) VISIBLE,
  INDEX `fk_Turma_Disciplina1_idx` (`Disciplina_idDisciplina` ASC) VISIBLE,
  INDEX `fk_Turma_Sala1_idx` (`Sala_idSala` ASC) VISIBLE,
  INDEX `fk_turma_aluno` (`turma_aluno_id` ASC) VISIBLE,
  CONSTRAINT `fk_Turma_Disciplina1`
    FOREIGN KEY (`Disciplina_idDisciplina`)
    REFERENCES `leitura`.`disciplina` (`idDisciplina`),
  CONSTRAINT `fk_Turma_Professor`
    FOREIGN KEY (`Professor_idProfessor`)
    REFERENCES `leitura`.`professor` (`idProfessor`),
  CONSTRAINT `fk_Turma_Sala1`
    FOREIGN KEY (`Sala_idSala`)
    REFERENCES `leitura`.`sala` (`idSala`)
) ENGINE = InnoDB AUTO_INCREMENT = 39 DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `leitura`.`turma_aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `leitura`.`turma_aluno` (
  `turma_id` INT NOT NULL,
  `aluno_id` INT NOT NULL,
  PRIMARY KEY (`turma_id`, `aluno_id`),
  INDEX `aluno_id` (`aluno_id` ASC) VISIBLE,
  CONSTRAINT `turma_aluno_ibfk_1`
    FOREIGN KEY (`turma_id`)
    REFERENCES `leitura`.`turma` (`idTurma`),
  CONSTRAINT `turma_aluno_ibfk_2`
    FOREIGN KEY (`aluno_id`)
    REFERENCES `leitura`.`aluno` (`idAluno`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

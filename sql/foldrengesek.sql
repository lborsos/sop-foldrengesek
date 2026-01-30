/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: foldrengesek
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `naplo`
--

DROP TABLE IF EXISTS `naplo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `naplo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `datum` date NOT NULL,
  `ido` time NOT NULL,
  `telepid` int(11) NOT NULL,
  `magnitudo` decimal(3,1) DEFAULT NULL,
  `intenzitas` decimal(3,1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `telepid` (`telepid`),
  CONSTRAINT `naplo_ibfk_1` FOREIGN KEY (`telepid`) REFERENCES `telepules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `naplo`
--

LOCK TABLES `naplo` WRITE;
/*!40000 ALTER TABLE `naplo` DISABLE KEYS */;
INSERT INTO `naplo` VALUES
(1,'2024-01-10','12:34:00',1,3.2,4.1),
(2,'2024-02-05','03:12:00',2,2.8,3.5),
(3,'2024-03-20','18:45:00',3,4.6,5.2),
(4,'2024-04-01','06:00:00',1,1.9,2.4),
(6,'2026-01-20','01:45:00',1,1.0,2.0);
/*!40000 ALTER TABLE `naplo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telepules`
--

DROP TABLE IF EXISTS `telepules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `telepules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `varmegye` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telepules`
--

LOCK TABLES `telepules` WRITE;
/*!40000 ALTER TABLE `telepules` DISABLE KEYS */;
INSERT INTO `telepules` VALUES
(1,'Kaposvár','Somogy'),
(2,'Siófok','Somogy'),
(3,'Pécs','Baranya'),
(4,'Szeged','Csongrád-Csanád');
/*!40000 ALTER TABLE `telepules` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-29 12:07:22

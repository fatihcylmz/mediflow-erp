namespace MediFlow.Drugs;

public enum PrescriptionType
{
    OverTheCounter = 0, // Reçetesiz
    White = 1,          // Normal reçete
    Green = 2,          // Yeşil reçete
    Red = 3,            // Kırmızı reçete
    Purple = 4,         // Mor reçete
    Orange = 5          // Turuncu reçete
}
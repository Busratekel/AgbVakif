namespace AgbVakif.Api;

public static class BasvuruTipi
{
    public const string Burs = "Burs";
    public const string Destek = "Destek";

    public static string Normalize(string? value)
    {
        var v = (value ?? "").Trim();
        if (v.Equals(Destek, StringComparison.OrdinalIgnoreCase)
            || v.Equals("yardim", StringComparison.OrdinalIgnoreCase)
            || v.Equals("Yardım", StringComparison.OrdinalIgnoreCase))
        {
            return Destek;
        }

        return Burs;
    }

    public static bool IsDestek(string tip) =>
        string.Equals(tip, Destek, StringComparison.Ordinal);
}

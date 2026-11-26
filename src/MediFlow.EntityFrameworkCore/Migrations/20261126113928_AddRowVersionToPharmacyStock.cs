using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionToPharmacyStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // PharmacyStock.RowVersion optimistic concurrency token'i —
            // daha önceki migration'lar bu kolonu fiziksel olarak eklememişti (yalnız ConcurrencyStamp vardı).
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AppPharmacyStocks",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AppPharmacyStocks");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleTraceabilityAndPharmacyStockIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AppStockBatches",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                table: "AppSales",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShipmentId",
                table: "AppSales",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPharmacyStocks_PharmacyId_DrugId_LotNumber",
                table: "AppPharmacyStocks",
                columns: new[] { "PharmacyId", "DrugId", "LotNumber" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppPharmacyStocks_PharmacyId_DrugId_LotNumber",
                table: "AppPharmacyStocks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AppStockBatches");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "AppSales");

            migrationBuilder.DropColumn(
                name: "ShipmentId",
                table: "AppSales");
        }
    }
}

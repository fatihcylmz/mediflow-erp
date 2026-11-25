using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddStockMovementReferenceTypeAndDrugPriceUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReferenceType",
                table: "AppStockMovementLogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AppStockMovementLogs_StockBatchId_ReferenceType_ReferenceId",
                table: "AppStockMovementLogs",
                columns: new[] { "StockBatchId", "ReferenceType", "ReferenceId" });

            migrationBuilder.CreateIndex(
                name: "IX_AppDrugPriceHistories_DrugId_ValidFrom",
                table: "AppDrugPriceHistories",
                columns: new[] { "DrugId", "ValidFrom" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppStockMovementLogs_StockBatchId_ReferenceType_ReferenceId",
                table: "AppStockMovementLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppDrugPriceHistories_DrugId_ValidFrom",
                table: "AppDrugPriceHistories");

            migrationBuilder.DropColumn(
                name: "ReferenceType",
                table: "AppStockMovementLogs");
        }
    }
}

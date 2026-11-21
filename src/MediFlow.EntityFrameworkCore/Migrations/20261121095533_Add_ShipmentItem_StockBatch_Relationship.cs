using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class Add_ShipmentItem_StockBatch_Relationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems",
                column: "StockBatchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems",
                column: "StockBatchId",
                unique: true,
                filter: "WHERE StockBatchId IS NOT NULL");
        }
    }
}

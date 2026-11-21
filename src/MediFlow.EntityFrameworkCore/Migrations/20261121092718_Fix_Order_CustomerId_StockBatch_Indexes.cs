using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class Fix_Order_CustomerId_StockBatch_Indexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "AppOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StockBatchId",
                table: "AppOrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppStockBatches_DrugId_ExpirationDate",
                table: "AppStockBatches",
                columns: new[] { "DrugId", "ExpirationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_AppOrders_OrderNumber",
                table: "AppOrders",
                column: "OrderNumber");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrders_PharmacyId",
                table: "AppOrders",
                column: "PharmacyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrderItems_DrugId",
                table: "AppOrderItems",
                column: "DrugId");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrderItems_OrderId",
                table: "AppOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems",
                column: "StockBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppOrderItems_AppDrugs_DrugId",
                table: "AppOrderItems",
                column: "DrugId",
                principalTable: "AppDrugs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppOrderItems_AppStockBatches_StockBatchId",
                table: "AppOrderItems",
                column: "StockBatchId",
                principalTable: "AppStockBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppOrderItems_AppDrugs_DrugId",
                table: "AppOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AppOrderItems_AppStockBatches_StockBatchId",
                table: "AppOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_AppStockBatches_DrugId_ExpirationDate",
                table: "AppStockBatches");

            migrationBuilder.DropIndex(
                name: "IX_AppOrders_OrderNumber",
                table: "AppOrders");

            migrationBuilder.DropIndex(
                name: "IX_AppOrders_PharmacyId",
                table: "AppOrders");

            migrationBuilder.DropIndex(
                name: "IX_AppOrderItems_DrugId",
                table: "AppOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_AppOrderItems_OrderId",
                table: "AppOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_AppOrderItems_StockBatchId",
                table: "AppOrderItems");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "AppOrders");

            migrationBuilder.DropColumn(
                name: "StockBatchId",
                table: "AppOrderItems");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class Add_SupplierId_To_StockBatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ShelfLocation",
                table: "AppStockBatches",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                table: "AppStockBatches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_AppStockBatches_SupplierId",
                table: "AppStockBatches",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppStockBatches_AppSuppliers_SupplierId",
                table: "AppStockBatches",
                column: "SupplierId",
                principalTable: "AppSuppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppStockBatches_AppSuppliers_SupplierId",
                table: "AppStockBatches");

            migrationBuilder.DropIndex(
                name: "IX_AppStockBatches_SupplierId",
                table: "AppStockBatches");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "AppStockBatches");

            migrationBuilder.AlterColumn<string>(
                name: "ShelfLocation",
                table: "AppStockBatches",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }
    }
}

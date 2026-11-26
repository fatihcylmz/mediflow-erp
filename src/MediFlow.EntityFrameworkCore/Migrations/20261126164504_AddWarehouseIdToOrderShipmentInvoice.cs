using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddWarehouseIdToOrderShipmentInvoice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "WarehouseId",
                table: "AppShipments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseName",
                table: "AppShipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WarehouseId",
                table: "AppOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseName",
                table: "AppOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WarehouseId",
                table: "AppInvoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarehouseName",
                table: "AppInvoices",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppShipments_WarehouseId",
                table: "AppShipments",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_AppOrders_WarehouseId",
                table: "AppOrders",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_AppInvoices_WarehouseId",
                table: "AppInvoices",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppInvoices_AppWarehouses_WarehouseId",
                table: "AppInvoices",
                column: "WarehouseId",
                principalTable: "AppWarehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppOrders_AppWarehouses_WarehouseId",
                table: "AppOrders",
                column: "WarehouseId",
                principalTable: "AppWarehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppShipments_AppWarehouses_WarehouseId",
                table: "AppShipments",
                column: "WarehouseId",
                principalTable: "AppWarehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppInvoices_AppWarehouses_WarehouseId",
                table: "AppInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_AppOrders_AppWarehouses_WarehouseId",
                table: "AppOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_AppShipments_AppWarehouses_WarehouseId",
                table: "AppShipments");

            migrationBuilder.DropIndex(
                name: "IX_AppShipments_WarehouseId",
                table: "AppShipments");

            migrationBuilder.DropIndex(
                name: "IX_AppOrders_WarehouseId",
                table: "AppOrders");

            migrationBuilder.DropIndex(
                name: "IX_AppInvoices_WarehouseId",
                table: "AppInvoices");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "AppShipments");

            migrationBuilder.DropColumn(
                name: "WarehouseName",
                table: "AppShipments");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "AppOrders");

            migrationBuilder.DropColumn(
                name: "WarehouseName",
                table: "AppOrders");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "AppInvoices");

            migrationBuilder.DropColumn(
                name: "WarehouseName",
                table: "AppInvoices");
        }
    }
}

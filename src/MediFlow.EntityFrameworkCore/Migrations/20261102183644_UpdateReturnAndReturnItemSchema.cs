using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReturnAndReturnItemSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "AppReturns");

            migrationBuilder.AddColumn<Guid>(
                name: "InvoiceId",
                table: "AppReturns",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "AppReturns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "DrugId",
                table: "AppReturnItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<decimal>(
                name: "LineTotal",
                table: "AppReturnItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxRate",
                table: "AppReturnItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "AppReturnItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceId",
                table: "AppReturns");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "AppReturns");

            migrationBuilder.DropColumn(
                name: "DrugId",
                table: "AppReturnItems");

            migrationBuilder.DropColumn(
                name: "LineTotal",
                table: "AppReturnItems");

            migrationBuilder.DropColumn(
                name: "TaxRate",
                table: "AppReturnItems");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "AppReturnItems");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "AppReturns",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}

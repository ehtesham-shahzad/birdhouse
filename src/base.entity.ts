import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {

    @PrimaryColumn()
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}

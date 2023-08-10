import { Column, Entity, Index, OneToMany } from "typeorm";
import { ColumnNumericTransformer } from "../../../utils/ColumnNumericTransformer";
import { BaseEntity } from "../../base.entity";
import { ResidenceHistory } from "./residence-history.entity";

@Entity()
export class Birdhouse extends BaseEntity {

    @Column({ nullable: false })
    @Index()
    ubid: string;

    @Column('numeric', { nullable: false, precision: 7, scale: 5, transformer: new ColumnNumericTransformer() })
    longitude: number;

    @Column('numeric', { nullable: false, precision: 7, scale: 5, transformer: new ColumnNumericTransformer() })
    latitude: number;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => ResidenceHistory, residenceHistory => residenceHistory.birdhouse)
    residenceHistory: ResidenceHistory[];
}

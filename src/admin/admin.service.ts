import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { AdminDTO } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Admin)
    private readonly userRepository: Repository<Admin>,
  ) {}

  async updateAdmin(adminDTO: AdminDTO): Promise<AdminDTO> {
    const admin = await this.adminRepository.findOne({
      where: {},
    });

    // Check if email already exists in users table (if email is being updated)
    if (adminDTO.email && adminDTO.email !== admin!.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: adminDTO.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update fields
    const updateData: any = {};
    if (adminDTO.email) updateData.email = adminDTO.email;

    // Hash password if provided
    if (adminDTO.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(adminDTO.password, saltRounds);
    }

    await this.adminRepository.update({ id: 0 }, updateData);

    // Fetch updated admin
    const updatedAdmin = await this.adminRepository.findOne({
      where: { id: 0 },
    });

    if (!updatedAdmin) {
      throw new NotFoundException('Failed to retrieve updated admin data');
    }

    return {
      email: updatedAdmin.email,
    };
  }
}
